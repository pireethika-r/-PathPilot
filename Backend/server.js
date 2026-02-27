import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import hiringRoutes from "./src/routes/hiringRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import learningRoutes from "./src/routes/learningRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import { initializeSocketServer } from "./src/socket/socketServer.js";
import { handleStripeWebhook } from "./src/controllers/learningController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

app.use(cors());
app.post(
  "/api/learning/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true, limit: "3mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "Backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hiring", hiringRoutes);
app.use("/api/users", userRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((err, _req, res, _next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request payload is too large. Reduce file size and try again.",
    });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const startServer = async () => {
  await connectDB();
  initializeSocketServer(httpServer);
  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();
