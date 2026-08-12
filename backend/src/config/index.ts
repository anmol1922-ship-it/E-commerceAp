import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  WARNING: JWT_SECRET is not set. Using insecure default. Set JWT_SECRET in production!",
  );
}

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl: process.env.DATABASE_URL || "",
  mongoUri: process.env.DATABASE_URL || process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "dev_only_insecure_secret_change_me",
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5174",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
};
