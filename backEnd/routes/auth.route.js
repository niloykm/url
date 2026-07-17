import express from "express";
import { signup, login, googleLogin, getWorkspaces, createWorkspace, updateTier } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/workspaces", requireAuth, getWorkspaces);
router.post("/workspaces", requireAuth, createWorkspace);
router.post("/update-tier", requireAuth, updateTier);

export { router as authRouter };
