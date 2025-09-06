import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { env } from "./env";
dotenv.config();

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
