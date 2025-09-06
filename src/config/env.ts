import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  BASE_URL: process.env.BASE_URL || "http://localhost:8000",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/kost-app",
  PORT: Number(process.env.PORT || 8000),
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  REDIS_URL: process.env.REDIS_URL || "", // e.g. redis://default:password@host:port

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
  MIDTRANS_PAYOUT_KEY_CREATOR: process.env.MIDTRANS_PAYOUT_KEY_CREATOR,
  MIDTRANS_PAYOUT_KEY_APPROVER: process.env.MIDTRANS_PAYOUT_KEY_APPROVER,
  MIDTRANS_PAYOUT_MERCHANT_KEY: process.env.MIDTRANS_PAYOUT_MERCHANT_KEY,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,

  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || "15m",
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "7d",

  EMAIL_FROM: process.env.EMAIL_FROM || process.env.SMTP_USER,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,

  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "localhost",
};
