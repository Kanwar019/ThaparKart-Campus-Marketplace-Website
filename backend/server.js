// Load configuration before imported controllers evaluate environment settings.
import "dotenv/config";
import process from "node:process";
import { getJwtSecret } from "./config/auth.js";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import http from "http"; // ✅ Required for Socket.io
import { Server as IOServer } from "socket.io"; // ✅ Socket.io
import { configureChatSockets } from "./socket.js";



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
// Fail before accepting connections when authentication is misconfigured.
getJwtSecret();

// ✅ Create HTTP server to wrap Express (needed for Socket.io)
const server = http.createServer(app);

// Allowed origins for CORS and Socket.io
const defaultOrigins = [
  "http://localhost:5173", // Vite dev
  "http://localhost:4173", // Vite preview
  "https://thaparkart.tiiny.site", // Tiiny Host frontend
  "https://thaparkart.onrender.com", // Render frontend
];

const envOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
]
  .filter(Boolean)
  .map((url) => url.trim().replace(/\/$/, ""));

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

// ✅ Initialize Socket.io with same CORS config
const io = new IOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// tell Express it’s behind a proxy (Render), so secure cookies work properly
app.set("trust proxy", 1);

connectDB();

// Express Middleware
app.use(
  cors({
    origin: allowedOrigins,
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
configureChatSockets(io);

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
