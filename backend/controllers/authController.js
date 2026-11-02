// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import process from "node:process";
import { getJwtSecret } from "../config/auth.js";

const JWT_EXPIRES_IN = "7d";
const isProduction = process.env.NODE_ENV === "production";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Cross-site cookie setup for Render <-> TiinyHost
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,             // must be true on Render
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const ADMIN_EMAILS = [
      "ksingh2_be23@thapar.edu",
      "ybhansali_be23@thapar.edu",
    ];
    const isAdmin = user.role === "admin" || ADMIN_EMAILS.includes(user.email.toLowerCase());

    return res.json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || (isAdmin ? "admin" : "user"),
        isAdmin,
      },
      isAdmin,
      token,
    });
  } catch (err) {
    console.error("Error in loginUser:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.json({ message: "Logged out successfully." });
};

export default { loginUser, logoutUser };
