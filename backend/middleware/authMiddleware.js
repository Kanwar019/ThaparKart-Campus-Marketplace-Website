import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authRequired = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret-change-this"
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
