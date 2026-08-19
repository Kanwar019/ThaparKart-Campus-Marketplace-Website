import express from "express";
import Feedback from "../models/Feedback.js";

const router = express.Router();

// POST → Save Feedback
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !email || !message) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const fb = await Feedback.create({ firstName, lastName, email, message });

    return res.status(201).json({ success: true, feedback: fb });
  } catch (err) {
    console.error("Feedback save error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while saving feedback",
    });
  }
});

// GET → All Feedback (for Admin)
router.get("/", async (req, res) => {
  try {
    const list = await Feedback.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error("Feedback fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

export default router;
