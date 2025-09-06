import { Request, Response, NextFunction } from "express";
import { RuleService } from "./rule.service";

export const RuleController = {
  async getRules(req: Request, res: Response, next: NextFunction) {
    try {
      const rules = await RuleService.getRules();
      res.status(200).json({ status: "success", data: rules });
    } catch (error) {
      next(error);
    }
  },
  async createRule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RuleService.createRule(req.body);
      res
        .status(200)
        .json({ message: "Fasilitas Kost berhasil dibuat", data: result });
    } catch (error) {
      next(error);
    }
  },
  async updateRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { ruleId } = req.params;
      const result = await RuleService.updateRule(ruleId, req.body);
      res
        .status(200)
        .json({ message: "Peraturan berhasil diubah", data: result });
    } catch (error) {
      next(error);
    }
  },
  async deleteRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { ruleId } = req.params;
      const result = await RuleService.deleteRule(ruleId);
      res
        .status(200)
        .json({ message: "Peraturan berhasil dihapus", data: result });
    } catch (error) {
      next(error);
    }
  },
};
