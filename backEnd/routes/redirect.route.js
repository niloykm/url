import express from "express";
import { createUrl, createBulkUrls } from "../controllers/createUrl.controller.js";
import { deleteUrlByIdentifier } from "../controllers/deleteUrl.controller.js";
import { getAllUrls } from "../controllers/getAllUrl.controller.js";
import { redirectUrl } from "../controllers/redirectUrl.controller.js";
import { updateUrl, bulkDelete } from "../controllers/updateUrl.controller.js";
import { getUrlAnalytics, exportCsv, getDashboardStats } from "../controllers/analytics.controller.js";
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting on link creation (Abuse Prevention)
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 creations per window
  message: { success: false, message: "Too many links created. Please wait 15 minutes or upgrade." },
});

// Create a new URL entry – POST /create
router.post("/create", optionalAuth, createLimiter, createUrl);

// Create bulk URLs – POST /create-bulk
router.post("/create-bulk", optionalAuth, createLimiter, createBulkUrls);

// Retrieve all URL entries – GET /all
router.get("/all", optionalAuth, getAllUrls);

// Get summary stats – GET /dashboard-stats
router.get("/dashboard-stats", requireAuth, getDashboardStats);

// Retrieve analytics for a link – GET /analytics/:identifier
router.get("/analytics/:identifier", optionalAuth, getUrlAnalytics);

// Export CSV – GET /analytics/:identifier/export
router.get("/analytics/:identifier/export", optionalAuth, exportCsv);

// Update a link settings/destination – PUT /:identifier
router.put("/:identifier", optionalAuth, updateUrl);

// Bulk delete links – POST /bulk-delete
router.post("/bulk-delete", optionalAuth, bulkDelete);

// Redirection – GET /:customUrl
router.get("/:customUrl", redirectUrl);

// Deletion – DELETE /:customUrl
router.delete("/:customUrl", optionalAuth, deleteUrlByIdentifier);

export { router as redirecto };
