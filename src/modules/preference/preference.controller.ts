import { Request, Response, NextFunction } from "express";
import { PreferenceService } from "./preference.service";

export const PreferenceController = {
  async setPreference(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;

      const preference = await PreferenceService.setPreference(
        tenantId,
        req.body
      );
      res
        .status(200)
        .json({ message: "Preferensi berhasil disimpan", preference });
    } catch (error) {
      next(error);
    }
  },

  async getPreference(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;
      const preference = await PreferenceService.getPreference(tenantId);
      res.status(200).json({ status: "success", data: preference });
    } catch (error) {
      next(error);
    }
  },
};
