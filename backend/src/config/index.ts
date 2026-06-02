import dotenv from "dotenv";
dotenv.config();

console.log("📋 Environment Variables on Load:");
console.log("  RAZORPAY_KEY_ID from process.env:", process.env.RAZORPAY_KEY_ID);
console.log(
  "  RAZORPAY_KEY_SECRET from process.env:",
  process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET",
);

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/bisleri",
  jwtSecret: process.env.JWT_SECRET || "bisleri_jwt_secret_change_in_prod",
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
};
