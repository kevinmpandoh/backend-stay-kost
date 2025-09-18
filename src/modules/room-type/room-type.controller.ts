import { Request, Response } from "express";

import { NextFunction } from "express-serve-static-core";
import { RoomTypeService } from "./room-type.service";

export default {
  async getRoomTypeOwner(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomTypeId } = req.params;
      const roomType = await RoomTypeService.getKostTypeOwner(roomTypeId);
      res.status(200).json({ status: "success", data: roomType });
    } catch (error) {
      next(error);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await RoomTypeService.createKostType(req.body);
      res.status(200).json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  },

  async updateRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomTypeId } = req.params;
      const ownerId = req.user.id;
      const kost = await RoomTypeService.update(roomTypeId, ownerId, req.body);
      res.status(200).json({ status: "success", data: kost });
    } catch (error) {
      next(error);
    }
  },

  async updateFacilities(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomTypeId } = req.params;

      const result = await RoomTypeService.updateFacilities(
        roomTypeId,
        req.body
      );
      res
        .status(200)
        .json({ message: "Fasilitas Kost berhasil ditambahkan", data: result });
    } catch (error) {
      next(error);
    }
  },

  async updatePhotoRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomTypeId } = req.params;
      const photo = await RoomTypeService.updatePhotoRoom(roomTypeId, req.body);

      res.status(201).json({
        status: "success",
        message: "Foto kost berhasil diperbarui",
        data: photo,
      });
    } catch (error) {
      next(error);
    }
  },

  updatePrice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomTypeId } = req.params;
      const ownerId = req.user.id;
      const result = await RoomTypeService.updatePrice(
        roomTypeId,
        req.body,
        ownerId
      );
      res.status(200).json({
        status: "success",
        message: "Harga berhasil ditambahkan.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomTypeId } = req.params;
      await RoomTypeService.delete(roomTypeId);
      res
        .status(200)
        .json({ status: "success", message: "Data Kost berhasil di hapus" });
    } catch (error) {
      next(error);
    }
  },
};
