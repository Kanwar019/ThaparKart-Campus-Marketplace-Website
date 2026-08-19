import dotenv from "dotenv";
// load env right away so other imported modules see process.env
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import http from "http"; // ✅ Required for Socket.io
import { Server as IOServer } from "socket.io"; // ✅ Socket.io

// OTP helpers & models
import crypto from "crypto";
import Otp from "./models/Otp.js";
import User from "./models/User.js";  // ✅ ADDED: Needed for finding user to reset pass
import bcrypt from "bcryptjs";        // ✅ ADDED: Needed for hashing new password
import { sendMail } from "./utils/mailer.js";

// Route imports
import userRoutes from "./routes/user/userRoutes.js";
import authRoutes from "./routes/auth/authRoutes.js";
import listingRoutes from "./routes/listing/listingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/order/orderRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import chatRoutes from "./routes/chat/chatRoutes.js"; 

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server to wrap Express (needed for Socket.io)
const server = http.createServer(app);

// ✅ Initialize Socket.io with same CORS config
const io = new IOServer(server, {
  cors: {
    origin: [
      "http://localhost:5173",         // Vite dev
      "http://localhost:4173",         // Vite preview
      "https://thaparkart.tiiny.site", // Tiiny Host frontend
      "https://thaparkart.onrender.com" // Render frontend
    ],
    credentials: true,
  },
});

// tell Express it’s behind a proxy (Render), so secure cookies work properly
app.set("trust proxy", 1);

console.log("MONGO_URI from env:", process.env.MONGO_URI);
connectDB();

// Express Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://thaparkart.tiiny.site",
      "https://thaparkart.onrender.com"
    ],
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "25mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "25mb",
  })
);

app.use(cookieParser());

// ✅ Attach 'io' to every request so API routes can send real-time alerts
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* =======================
   SOCKET.IO EVENTS
   ======================= */
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join a personal room based on User ID
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(String(userId));
      console.log(`User ${userId} joined their notification room.`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* =======================
   OTP SERVICE
   ======================= */

// helper - generate 6-digit code
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// helper - hash OTP with sha256
function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES) || 5;

// POST /api/auth/send-otp
app.post("/api/auth/send-otp", async (req, res) => {
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
});

// POST /api/auth/verify-otp
app.post("/api/auth/verify-otp", async (req, res) => {
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
});

// ✅ NEW: POST /api/auth/reset-password (For Forgot Password Flow)
app.post("/api/auth/reset-password", async (req, res) => {
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
});

/* =======================
   ROUTES
   ======================= */

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes); // ✅ Chat

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "ThaparKart backend running" });
});

// ✅ CHANGED: Use server.listen instead of app.listen for Socket.io to work
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});