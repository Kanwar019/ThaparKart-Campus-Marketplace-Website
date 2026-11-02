import { Router } from "express";
import { googleLogin } from "../../controllers/googleAuthController.js";
import { loginUser, logoutUser } from "../../controllers/authController.js";
import { loginLimiter } from "../../middleware/rateLimitMiddleware.js";

const router = Router();
router.post("/google", loginLimiter, googleLogin);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);

// Explicit migration response for old clients; no mail or database operations.
router.post(["/register", "/send-otp", "/verify-otp", "/reset-password", "/forgot-password"], (_req, res) => {
  res.status(410).json({ message: "Email OTP registration and password recovery have been retired. Please use Continue with Google with your @thapar.edu account." });
});

export default router;
