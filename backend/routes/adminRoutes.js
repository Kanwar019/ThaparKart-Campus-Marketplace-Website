// routes/adminRoutes.js
import express from "express";
import {
  getAdminStats,
  exportAllData,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", getAdminStats);
router.get("/export", exportAllData);

export default router;
