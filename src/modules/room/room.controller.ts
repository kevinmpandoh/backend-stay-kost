import { Request, Response, NextFunction } from "express";
import roomService from "./room.service";

export const RoomController = {
  async getRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await roomService.getAll();
      res.status(200).json({ status: "success", data: rooms });
    } catch (error) {
      next(error);
    }
  },

  async getRoomsByKostType(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomTypeId } = req.params;
      const { status } = req.query;
      const rooms = await roomService.getRooms(roomTypeId, status);
      res.json({ status: "success", data: rooms });
    } catch (error) {
      next(error);
    }
  },
  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomTypeId } = req.params;
      const result = await roomService.createRoom({
        roomTypeId,
        payload: req.body,
      });
      res
        .status(200)
        .json({ message: "Fasilitas Kost berhasil dibuat", data: result });
    } catch (error) {
      next(error);
    }
  },
  async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const result = await roomService.updateRoom(roomId, req.body);
      res
        .status(200)
        .json({ message: "Peraturan berhasil diubah", data: result });
    } catch (error) {
      next(error);
    }
  },
  async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const result = await roomService.deleteRoom(roomId);
      res
        .status(200)
        .json({ message: "Peraturan berhasil dihapus", data: result });
    } catch (error) {
      next(error);
    }
  },
};
