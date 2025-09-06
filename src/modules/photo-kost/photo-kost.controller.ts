// src/modules/photoKost/photoKost.controller.ts
import { Request, Response } from "express";
import { photoKostService } from "./photo-kost.service";
import { PhotoCategory } from "./photo-kost.model";
import { uploadPhotoKostSchema } from "./photo-kost.validation";
import { validate } from "@/middlewares/validate.middleware";

export const PhotoKostController = {
  async upload(req: Request, res: Response) {
    try {
      const { kostId, category } = req.body;

      const ownerId = req.user.id;

      const photo = await photoKostService.uploadPhoto(
        kostId,
        req.file as Express.Multer.File,
        category as PhotoCategory,
        ownerId
      );
      res.json(photo);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { photoId } = req.params;
      const result = await photoKostService.deletePhoto(photoId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async replace(req: Request, res: Response) {
    try {
      const { photoId } = req.params;

      const photo = await photoKostService.replacePhoto(
        photoId,
        req.file as Express.Multer.File
      );
      res.json(photo);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },
};
