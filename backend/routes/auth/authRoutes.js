// backend/routes/authRoutes.js
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  sendOtp,
  verifyOtp,
  resetPassword,
} from "../../controllers/authController.js";
import {
  otpLimiter,
  otpVerifyLimiter,
  loginLimiter,
  passwordResetLimiter,
} from "../../middleware/rateLimitMiddleware.js";

const router = Router();

// POST /api/auth/register
router.post("/register", otpVerifyLimiter, registerUser);

// POST /api/auth/login (with rate limiting)
router.post("/login", loginLimiter, loginUser);

// POST /api/auth/logout
router.post("/logout", logoutUser);

// POST /api/auth/send-otp (with rate limiting)
router.post("/send-otp", otpLimiter, sendOtp);

// POST /api/auth/verify-otp (with rate limiting)
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);

// POST /api/auth/reset-password (with rate limiting)
router.post("/reset-password", passwordResetLimiter, resetPassword);

export default router;

