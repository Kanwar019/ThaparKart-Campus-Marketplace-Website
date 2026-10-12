import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getJwtSecret } from "../config/auth.js";

export const authRequired = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const decoded = jwt.verify(
      token,
      getJwtSecret()
    );

    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("authRequired error:", err);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// 👉 Add this line:
export const requireAuth = authRequired;

const ADMIN_EMAILS = [
  "ksingh2_be23@thapar.edu",
  "ybhansali_be23@thapar.edu",
];

export const adminRequired = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const isEmailAdmin = ADMIN_EMAILS.includes(req.user.email?.toLowerCase());
  const isRoleAdmin = req.user.role === "admin";

  if (!isEmailAdmin && !isRoleAdmin) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }

  next();
};

