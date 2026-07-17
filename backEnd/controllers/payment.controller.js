import Stripe from "stripe";
import User from "../models/user.model.js";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const createCheckoutSession = async (req, res) => {
  try {
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "NewRL Premium Tier Subscription",
                description: "Unlock advanced analytics, custom domains, link password & click-limit expirations, and bulk shortening.",
              },
              unit_amount: 999, // $9.99
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${FRONTEND_URL}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${FRONTEND_URL}/billing?success=false`,
        customer_email: req.user.email,
        metadata: {
          userId: req.user._id.toString(),
        },
      });
      return res.status(200).json({ success: true, url: session.url });
    } else {
      // Mock payment for local testing / sandbox
      // Return a simulated success redirection url
      const mockSessionId = `mock_sess_${Date.now()}`;
      const url = `${FRONTEND_URL}/billing?session_id=${mockSessionId}&success=true`;
      return res.status(200).json({ success: true, url, isMock: true });
    }
  } catch (error) {
    console.error("Create Stripe session error:", error);
    res.status(500).json({ success: false, message: "Failed to create checkout session" });
  }
};

export const verifyCheckoutSession = async (req, res) => {
  const { sessionId } = req.body;
  try {
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID required" });
    }
    
    // Simulate or retrieve
    if (sessionId.startsWith("mock_sess_") || !stripe) {
      // Upgrade user
      req.user.tier = "paid";
      await req.user.save();
      return res.status(200).json({ success: true, message: "Subscription activated successfully (Simulation)", tier: "paid" });
    } else {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        const userId = session.metadata.userId;
        const user = await User.findById(userId);
        if (user) {
          user.tier = "paid";
          await user.save();
          return res.status(200).json({ success: true, message: "Subscription activated successfully", tier: "paid" });
        }
      }
      return res.status(400).json({ success: false, message: "Session payment not verified" });
    }
  } catch (error) {
    console.error("Verify Stripe session error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
