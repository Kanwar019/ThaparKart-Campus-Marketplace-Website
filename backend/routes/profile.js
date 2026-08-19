// routes/profile.js
const express = require("express");
const router = express.Router();

// Temporary in-memory "user" (no DB yet)
let profile = {
  name: "Kanwarajaybir Singh",
  email: "kanwarajaybir@thapar.edu",
};

// GET /api/profile
router.get("/", (req, res) => {
  res.json(profile);
});

// PUT /api/profile
router.put("/", (req, res) => {
  const { name } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Invalid name" });
  }

  profile = { ...profile, name: name.trim() };
  res.json(profile);
});

module.exports = router;
