// src/modules/photoKost/photoKost.controller.ts
import { Request, Response } from "express";
import { photoRoomService } from "./photo-room.service";
import { PhotoRoomCategory } from "./photo-room.model";
import { NextFunction } from "express-serve-static-core";

export const PhotoRoomController = {
  async getPhotoByRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomTypeId } = req.params;
      const photos = await photoRoomService.getPhotoByRoomType(roomTypeId);
      res.status(200).json({ status: "success", data: photos });
    } catch (error) {
      next(error);
    }
  },
  async upload(req: Request, res: Response) {
    try {
      const { roomTypeId, category } = req.body;
      const ownerId = req.user.id;
      const photo = await photoRoomService.uploadPhoto(
        roomTypeId,
        req.file as Express.Multer.File,
        category as PhotoRoomCategory,
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
      const result = await photoRoomService.deletePhoto(photoId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async replace(req: Request, res: Response) {
    try {
      const { photoId } = req.params;
      const { category } = req.body;

      const photo = await photoRoomService.replacePhoto(
        photoId,
        req.file as Express.Multer.File,
        category as PhotoRoomCategory
      );
      res.json(photo);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },
};
