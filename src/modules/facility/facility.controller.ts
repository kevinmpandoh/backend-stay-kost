import { Request, Response, NextFunction } from "express";
import { FacilityService } from "./facility.service";

export const FacilityController = {
  async getFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const facilities = await FacilityService.getAll();
      res.status(200).json({ status: "success", data: facilities });
    } catch (error) {
      next(error);
    }
  },
  async createFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FacilityService.createFacility(req.body);
      res
        .status(200)
        .json({ message: "Fasilitas Kost berhasil dibuat", data: result });
    } catch (error) {
      next(error);
    }
  },
  async updateFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId } = req.params;
      const result = await FacilityService.updateFacility(facilityId, req.body);
      res
        .status(200)
        .json({ message: "Peraturan berhasil diubah", data: result });
    } catch (error) {
      next(error);
    }
  },
  async deleteFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId } = req.params;
      const result = await FacilityService.deleteFacility(facilityId);
      res
        .status(200)
        .json({ message: "Peraturan berhasil dihapus", data: result });
    } catch (error) {
      next(error);
    }
  },
};
