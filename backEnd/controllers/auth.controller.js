import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_12345";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    
    // Create personal workspace
    const personalWS = new Workspace({
      name: `${name || "My"} Workspace`,
      ownerId: user._id,
      members: [{ userId: user._id, role: "admin" }],
    });
    await personalWS.save();
    
    user.workspaces.push(personalWS._id);
    await user.save();
    
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, tier: user.tier },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }
    
    // Ensure user has at least one workspace
    if (user.workspaces.length === 0) {
      const personalWS = new Workspace({
        name: `${user.name || "My"} Workspace`,
        ownerId: user._id,
        members: [{ userId: user._id, role: "admin" }],
      });
      await personalWS.save();
      user.workspaces.push(personalWS._id);
      await user.save();
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, tier: user.tier },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

export const googleLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    let email, name, googleId;
    if (googleClient && credential) {
      // Verify with google-auth-library
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    } else {
      // Development fallback / sandbox when client credentials might not be configured in env
      // The user passes email, name, googleId directly for simulation.
      email = req.body.email;
      name = req.body.name;
      googleId = req.body.googleId || `g_${Date.now()}`;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email required for Google Login simulation" });
      }
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, googleId, name, tier: "free" });
      const personalWS = new Workspace({
        name: `${name || "My"} Workspace`,
        ownerId: user._id,
        members: [{ userId: user._id, role: "admin" }],
      });
      await personalWS.save();
      user.workspaces.push(personalWS._id);
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, tier: user.tier },
    });
  } catch (error) {
    console.error("Google Auth error:", error);
    res.status(500).json({ success: false, message: "Google sign-in failed" });
  }
};

export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ "members.userId": req.user._id });
    res.status(200).json({ success: true, data: workspaces });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load workspaces" });
  }
};

export const createWorkspace = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ success: false, message: "Workspace name is required" });
    }
    const ws = new Workspace({
      name,
      ownerId: req.user._id,
      members: [{ userId: req.user._id, role: "admin" }],
    });
    await ws.save();
    req.user.workspaces.push(ws._id);
    await req.user.save();
    res.status(201).json({ success: true, data: ws });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create workspace" });
  }
};

export const updateTier = async (req, res) => {
  const { tier } = req.body;
  try {
    if (!["free", "paid"].includes(tier)) {
      return res.status(400).json({ success: false, message: "Invalid tier type" });
    }
    req.user.tier = tier;
    await req.user.save();
    res.status(200).json({ success: true, user: { id: req.user._id, email: req.user.email, tier: req.user.tier } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update tier" });
  }
};
