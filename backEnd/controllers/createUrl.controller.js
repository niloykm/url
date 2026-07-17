import { createUrlEntry } from "../services/url.service.js";
import bcrypt from "bcryptjs";

export const createUrl = async (req, res) => {
  try {
    const {
      originalUrl,
      customUrl,
      password,
      expiresAt,
      clickLimit,
      customDomain,
      title,
      description,
      imageUrl,
      workspaceId,
      captchaToken, // client-side captcha token validation placeholder
    } = req.body;

    // Simulated CAPTCHA check
    if (captchaToken === "fail") {
      return res.status(400).json({ success: false, message: "CAPTCHA verification failed." });
    }

    let hashedPassword = undefined;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const savedUrl = await createUrlEntry({
      originalUrl,
      customUrl,
      userId: req.user ? req.user._id : undefined,
      workspaceId,
      password: hashedPassword,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      clickLimit: clickLimit ? parseInt(clickLimit) : undefined,
      customDomain,
      title,
      description,
      imageUrl,
    });

    return res.status(201).json({
      success: true,
      data: savedUrl,
      message: "URL created successfully",
    });
  } catch (error) {
    if (error.code === 11000 || error.message.includes("exists")) {
      return res.status(400).json({
        success: false,
        message: "Custom alias or URL short-code already exists.",
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create URL",
    });
  }
};

export const createBulkUrls = async (req, res) => {
  const { urls, workspaceId } = req.body; // urls: Array of { originalUrl, customUrl }
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid bulk data. Must be array." });
  }

  // Paid tier check (free users have limit, paid can do unlimited bulk)
  const limit = req.user && req.user.tier === "paid" ? 100 : 5;
  if (urls.length > limit) {
    return res.status(403).json({
      success: false,
      message: `Bulk limit is ${limit} links. Please upgrade to Premium for larger batches!`,
    });
  }

  const results = [];
  for (const item of urls) {
    try {
      const saved = await createUrlEntry({
        originalUrl: item.originalUrl,
        customUrl: item.customUrl,
        userId: req.user ? req.user._id : undefined,
        workspaceId,
      });
      results.push({ originalUrl: item.originalUrl, shortUrl: saved.customUrl || saved.defaultId, success: true });
    } catch (err) {
      results.push({ originalUrl: item.originalUrl, message: err.message, success: false });
    }
  }

  return res.status(200).json({ success: true, data: results });
};
