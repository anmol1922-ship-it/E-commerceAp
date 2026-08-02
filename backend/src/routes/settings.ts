import { Router } from "express";
import { authenticate, isAdmin } from "../middleware/auth";
import {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
} from "../controllers/settingsController";

const router = Router();

// Public route - no auth required (frontend needs GST, delivery charges, pincodes)
router.get("/public", getPublicSettings);

// Admin routes
router.get("/", authenticate, isAdmin, getAdminSettings);
router.put("/", authenticate, isAdmin, updateSettings);

export default router;
