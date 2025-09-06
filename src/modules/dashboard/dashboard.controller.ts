import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./dashboard.service";

export const DashboardController = {
  async getOwnerDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getOwnerDashboard(req.user.id);
      res.status(200).json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  },
  async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getAdminDashboard();
      res.status(200).json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  },
};
