import rateLimit from "express-rate-limit";

// Rate limiter for OTP requests (sending OTP to email)
// Max 5 OTP requests per 15 minutes per IP to prevent spamming SMTP & Gmail quota
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: "Too many OTP requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for verifying OTP (preventing brute-force on 6-digit codes)
// Max 10 attempts per 15 minutes
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many incorrect attempts. Please request a new OTP after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for login endpoint (preventing credential stuffing / brute-force)
// Max 10 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password resets
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many password reset requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for chat messages (prevent spamming chat / socket events)
// Max 60 messages per minute per IP
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    message: "Too many messages sent. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for submitting feedback (prevent spamming feedback / DB writes)
// Max 10 submissions per 15 minutes per IP
export const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many feedback submissions. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

