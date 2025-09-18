import { Request, Response } from "express";
import kostService from "./kost.service";
import { NextFunction } from "express-serve-static-core";
import { photoKostService } from "../photo-kost/photo-kost.service";

export default {
  async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, pagination } = await kostService.getAll(req.validatedQuery);
      res.status(200).json({ status: "success", data, pagination });
    } catch (error) {
      next(error);
    }
  },

  async getKostById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await kostService.getKostById(req.params.kostId);
      res.status(200).json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  },

  async getDetailKostPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await kostService.getDetailKostPublic(req.params.roomTypeId);
      res.status(200).json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  },

  async listOwnerKost(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user.id;
      const kosts = await kostService.listOwner(ownerId);
      res.status(200).json({ status: "success", data: kosts });
    } catch (error) {
      next(error);
    }
  },
  async createKost(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user.id;

      const data = await kostService.createKost(ownerId, req.body);
      res.status(200).json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  },

  async getDetailOwnerKost(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user.id;
      const { kostId } = req.params;

      const kost = await kostService.getDetailOwnerKost(ownerId, kostId);
      res.status(200).json({ status: "success", data: kost });
    } catch (error) {
      next(error);
    }
  },

  async updateKost(req: Request, res: Response, next: NextFunction) {
    try {
      const { kostId } = req.params;
      const ownerId = req.user.id;
      const kost = await kostService.updateKost(kostId, ownerId, req.body);
      res.status(200).json({ status: "success", data: kost });
    } catch (error) {
      next(error);
    }
  },

  updateAddress: async (req: Request, res: Response) => {
    const { kostId } = req.params;
    const updated = await kostService.updateAddress(kostId, req.body);
    res.json(updated);
  },

  async updateFacilities(req: Request, res: Response, next: NextFunction) {
    try {
      const { kostId } = req.params;
      const result = await kostService.updateFacilities(kostId, req.body);
      res
        .status(200)
        .json({ message: "Fasilitas Kost berhasil ditambahkan", data: result });
    } catch (error) {
      next(error);
    }
  },

  async updatePhotoKost(req: Request, res: Response, next: NextFunction) {
    try {
      const { kostId } = req.params;
      const photo = await kostService.updatePhotoKost(kostId);

      res.status(201).json({
        status: "success",
        message: "Foto kost berhasil diperbarui",
        data: photo,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const { kostId } = req.params;
      const data = await kostService.updateRoomType(kostId, req.body);
      res.status(200).json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  },

  async listAllPending(req: Request, res: Response, next: NextFunction) {
    try {
      const kosts = await kostService.listAllPending();
      res.status(200).json({ status: "success", data: kosts });
    } catch (error) {
      next(error);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { kostId } = req.params;
      await kostService.approve(kostId);
      res
        .status(200)
        .json({ status: "success", message: "Kost berhasil disetujui" });
    } catch (error) {
      next(error);
    }
  },
  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { kostId } = req.params;
      const { rejectionReason } = req.body;
      await kostService.reject(kostId, rejectionReason);
      res
        .status(200)
        .json({ status: "success", message: "Kost berhasil ditolak" });
    } catch (error) {
      next(error);
    }
  },

  async deleteKost(req: Request, res: Response, next: NextFunction) {
    try {
      const { kostId } = req.params;
      await kostService.deleteKost(kostId);
      res
        .status(200)
        .json({ status: "success", message: "Data Kost berhasil di hapus" });
    } catch (error) {
      next(error);
    }
  },

  async getAllPhotoKost(req: Request, res: Response, next: NextFunction) {
    try {
      const kostId = req.params.kostId;
      const photos = await photoKostService.getAllPhotos(kostId);
      res.status(200).json({ status: "success", data: photos });
    } catch (error) {
      next(error);
    }
  },
};
