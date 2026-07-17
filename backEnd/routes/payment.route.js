import express from "express";
import { createCheckoutSession, verifyCheckoutSession } from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-session", requireAuth, createCheckoutSession);
router.post("/verify-session", requireAuth, verifyCheckoutSession);

export { router as paymentRouter };
