import dotenv from "dotenv";
// load env right away so other imported modules see process.env
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import http from "http"; // ✅ Required for Socket.io
import { Server as IOServer } from "socket.io"; // ✅ Socket.io



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