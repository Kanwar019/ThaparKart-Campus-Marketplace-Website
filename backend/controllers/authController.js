// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import crypto from "crypto";
import { sendMail } from "../utils/mailer.js";
import process from "node:process";
import { getJwtSecret } from "../config/auth.js";

const JWT_EXPIRES_IN = "7d";
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES) || 5;
const isProduction = process.env.NODE_ENV === "production";

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

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

    const ADMIN_EMAILS = [
      "ksingh2_be23@thapar.edu",
      "ybhansali_be23@thapar.edu",
    ];
    const role = ADMIN_EMAILS.includes(email.toLowerCase().trim()) ? "admin" : "user";

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
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

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.endsWith("@thapar.edu")) {
      return res.status(400).json({ message: "Valid @thapar.edu email required." });
    }

    const code = generateOtpCode();
    const otpHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // remove prior OTPs for this email and create new
    await Otp.deleteMany({ email: email.toLowerCase() });
    await Otp.create({ email: email.toLowerCase(), otpHash, expiresAt });

    // send email
    const subject = "ThaparKart — Your OTP";
    const text = `Your ThaparKart OTP is ${code}. It expires in ${OTP_TTL_MINUTES} minute(s).`;
    const html = `<p>Your ThaparKart OTP is <strong>${code}</strong>.</p><p>It expires in ${OTP_TTL_MINUTES} minute(s).</p>`;

    await sendMail({ to: email, subject, text, html });

    console.log(`OTP sent to ${email} (expires ${expiresAt.toISOString()})`);
    return res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("send-otp error:", err);
    return res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const record = await Otp.findOne({ email: email.toLowerCase() });
    if (!record) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    if (new Date() > record.expiresAt) {
      await Otp.deleteMany({ email: email.toLowerCase() });
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    const providedHash = hashOtp(otp);
    if (providedHash !== record.otpHash) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    // valid -> delete OTP records for this email to prevent reuse
    await Otp.deleteMany({ email: email.toLowerCase() });

    return res.json({ message: "OTP verified successfully." });
  } catch (err) {
    console.error("verify-otp error:", err);
    return res.status(500).json({ message: "Failed to verify OTP. Please try again." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 1. Verify OTP First
    const record = await Otp.findOne({ email: email.toLowerCase() });
    if (!record) {
      return res.status(400).json({ message: "No OTP found. Request a new one." });
    }
    if (new Date() > record.expiresAt) {
      await Otp.deleteMany({ email: email.toLowerCase() });
      return res.status(400).json({ message: "OTP expired." });
    }
    const providedHash = hashOtp(otp);
    if (providedHash !== record.otpHash) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    // 2. Find User
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    // 4. Cleanup OTP
    await Otp.deleteMany({ email: email.toLowerCase() });

    return res.json({ message: "Password reset successfully. Please login." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error resetting password." });
  }
};

export default { registerUser, loginUser, logoutUser, sendOtp, verifyOtp, resetPassword };

