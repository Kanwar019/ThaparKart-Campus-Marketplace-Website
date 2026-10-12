// routes/adminRoutes.js
import express from "express";
import {
  getAdminStats,
  exportAllData,
} from "../controllers/adminController.js";
import { authRequired, adminRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication and admin role check to all admin endpoints
router.use(authRequired, adminRequired);

router.get("/stats", getAdminStats);
router.get("/export", exportAllData);

export default router;

