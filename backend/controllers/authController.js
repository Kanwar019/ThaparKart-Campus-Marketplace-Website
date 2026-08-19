// backend/controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import crypto from "crypto";

const JWT_EXPIRES_IN = "7d";
const isProduction = process.env.NODE_ENV === "production";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!email.endsWith("@thapar.edu")) {
      return res
        .status(400)
        .json({ message: "Please use a valid @thapar.edu email." });
    }

    // Verify OTP from DB
    const record = await Otp.findOne({ email: email.toLowerCase() });
    if (!record) {
      return res.status(400).json({ message: "OTP missing or expired." });
    }

    if (new Date() > record.expiresAt) {
      await Otp.deleteMany({ email: email.toLowerCase() });
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    const providedHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (providedHash !== record.otpHash) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP valid -> remove it to prevent reuse
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    return res.status(201).json({
      message: "Registration successful. Please login.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error in registerUser:", err);
    return res.status(500).json({ message: "Server error during registration." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "dev-secret-change-this",
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Cross-site cookie setup for Render <-> TiinyHost
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,             // must be true on Render
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
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

export default { registerUser, loginUser, logoutUser };
