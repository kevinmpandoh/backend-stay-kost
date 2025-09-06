import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { ResponseError } from "@/utils/response-error.utils";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimum 5MB
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new ResponseError(
          400,
          "Format file tidak didukung. Hanya JPG, PNG, atau WEBP yang diperbolehkan."
        )
      );
    }

    cb(null, true); // File valid
  },
});
