import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import connectDB from "./config/db";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import settingsRoutes from "./routes/settings";

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Compression & logging
app.use(compression());
if (config.nodeEnv !== "production") {
  app.use(morgan("dev"));
}

// Static files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  // Log configuration for debugging
  console.log("🔧 Configuration loaded:");
  console.log("  PORT:", config.port);
  console.log("  NODE_ENV:", config.nodeEnv);
  console.log(
    "  RAZORPAY_KEY_ID:",
    config.razorpayKeyId ? "✅ SET" : "❌ MISSING",
  );
  console.log(
    "  RAZORPAY_KEY_SECRET:",
    config.razorpayKeySecret ? "✅ SET" : "❌ MISSING",
  );
  console.log("  DATABASE_URL:", config.mongoUri ? "✅ SET" : "❌ MISSING");

  app.listen(config.port, () => {
    logger.info(
      `🚀 Bisleri API running on port ${config.port} [${config.nodeEnv}]`,
    );
  });
};

startServer();

export default app;
