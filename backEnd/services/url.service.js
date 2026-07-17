import mongoose from "mongoose";
import URLModel from "../models/url.model.js";
import { nanoid } from "nanoid";

// In-memory fallback store
const memoryStore = {
  urls: [],
};

const isDbConnected = () => mongoose.connection.readyState === 1;

export const createUrlEntry = async ({
  originalUrl,
  customUrl,
  userId,
  workspaceId,
  password,
  expiresAt,
  clickLimit,
  customDomain,
  title,
  description,
  imageUrl,
}) => {
  const defaultId = nanoid(6);
  const finalCustom = customUrl && customUrl.trim() ? customUrl.trim() : defaultId;

  // URL Validation
  try {
    new URL(originalUrl);
  } catch (err) {
    throw new Error("Invalid URL format");
  }

  // Malware / Phishing simulation check
  const lowcaseUrl = originalUrl.toLowerCase();
  if (
    lowcaseUrl.includes("malware") ||
    lowcaseUrl.includes("phishing") ||
    lowcaseUrl.includes("virus") ||
    lowcaseUrl.includes("hack-your-account")
  ) {
    throw new Error("Potential malware/phishing detected! URL blocked.");
  }

  if (isDbConnected()) {
    // Duplicate detection (only reuse if it doesn't have custom configs)
    if (!customUrl && !password && !expiresAt && !clickLimit && !customDomain) {
      const existing = await URLModel.findOne({
        originalUrl,
        userId: userId || null,
        customUrl: null,
        password: null,
        expiresAt: null,
        clickLimit: null,
      });
      if (existing) return existing;
    }

    // Check custom URL uniqueness
    if (customUrl) {
      const existingCustom = await URLModel.findOne({
        $or: [{ customUrl: finalCustom }, { defaultId: finalCustom }],
      });
      if (existingCustom) {
        const err = new Error("Custom URL already exists");
        err.code = 11000;
        throw err;
      }
    }

    const newDoc = new URLModel({
      originalUrl,
      customUrl: customUrl && customUrl.trim() ? customUrl.trim() : undefined,
      defaultId,
      userId,
      workspaceId,
      password, // Should be hashed beforehand if password is set
      expiresAt,
      clickLimit,
      customDomain,
      title,
      description,
      imageUrl,
    });
    const saved = await newDoc.save();
    return saved;
  }

  // Fallback to in-memory store
  if (
    memoryStore.urls.find((u) => u.customUrl === finalCustom || u.defaultId === finalCustom)
  ) {
    const err = new Error("duplicate");
    err.code = 11000;
    throw err;
  }

  const entry = {
    _id: new mongoose.Types.ObjectId().toString(),
    originalUrl,
    customUrl: customUrl && customUrl.trim() ? customUrl.trim() : undefined,
    defaultId,
    userId,
    workspaceId,
    password,
    expiresAt,
    clickLimit,
    clicks: 0,
    isActive: true,
    customDomain,
    title,
    description,
    imageUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.urls.push(entry);
  return entry;
};

export const getAllEntries = async (userId, workspaceId) => {
  if (isDbConnected()) {
    const filter = {};
    if (workspaceId) {
      filter.workspaceId = workspaceId;
    } else if (userId) {
      filter.userId = userId;
    } else {
      // Free/Public mode
      filter.userId = null;
    }
    return await URLModel.find(filter).sort({ createdAt: -1 });
  }

  return memoryStore.urls
    .filter((u) => {
      if (workspaceId) return String(u.workspaceId) === String(workspaceId);
      if (userId) return String(u.userId) === String(userId);
      return !u.userId;
    })
    .reverse();
};

export const findByIdentifier = async (identifier) => {
  if (isDbConnected()) {
    return await URLModel.findOne({
      $or: [{ customUrl: identifier }, { defaultId: identifier }],
    });
  }
  return (
    memoryStore.urls.find(
      (u) => u.customUrl === identifier || u.defaultId === identifier
    ) || null
  );
};

export const deleteByIdentifier = async (identifier) => {
  if (isDbConnected()) {
    return await URLModel.findOneAndDelete({
      $or: [{ customUrl: identifier }, { defaultId: identifier }],
    });
  }
  const idx = memoryStore.urls.findIndex(
    (u) => u.customUrl === identifier || u.defaultId === identifier
  );
  if (idx === -1) return null;
  const [deleted] = memoryStore.urls.splice(idx, 1);
  return deleted;
};
