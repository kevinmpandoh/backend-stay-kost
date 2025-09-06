// import cloudinary from "../config/cloudinary";

// export const uploadImage = async (filePath: string, folder: string) => {
//   const result = await cloudinary.uploader.upload(filePath, { folder });
//   return result.secure_url;
// };

import cloudinary from "@/config/cloudinary";
import { Readable } from "stream";

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};
