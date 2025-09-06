import mongoose from "mongoose";
import logger from "./logger";

export async function connectDB(uri: string) {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error", err);
    process.exit(1);
  }
}
