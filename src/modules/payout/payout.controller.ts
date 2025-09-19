import { NextFunction, Request, Response } from "express";
import payoutService from "./payout.service";

export const PayoutController = {
  async getAllPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payoutService.getAllPayout({
        query: req.validatedQuery,
      });
      res.status(200).json({
        status: "success",
        message: "Berhasil mendapatkan data payout",
        ...result,
      });
    } catch (error: any) {
      next(error);
    }
  },

  async handleMidtransCallback(
    req: Request & { rawBody?: string },
    res: Response,
    next: NextFunction
  ) {
    try {
      await payoutService.processPayoutNotification({
        rawBody: req.rawBody!,
        headers: req.headers,
        body: req.body,
      });

      res.status(200).json({ message: "Notification processed" });
    } catch (error) {
      next(error);
    }
  },
  async getAllBeneficiaries(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payoutService.getAllBeneficiaries();
      res.status(200).json({
        status: "success",
        message: "Berhasil mendapatkan data Penerima",
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  },
  async updateBeneficiaries(req: Request, res: Response, next: NextFunction) {
    try {
      const { aliasName } = req.params;
      const result = await payoutService.updateBeneficiaries(
        aliasName,
        req.body
      );
      res.status(200).json({
        status: "success",
        message: "Berhasil mendapatkan data payout",
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  },

  async approvePayout(req: Request, res: Response, next: NextFunction) {
    try {
      const { payoutId } = req.params;
      const result = await payoutService.approvePayout(payoutId);
      res.status(200).json({
        status: "success",
        message: "Payout berhasil disetujui",
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  },
  async sendPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const { payoutId } = req.params;
      const result = await payoutService.sendPayout(payoutId);
      res.status(200).json({
        status: "success",
        message: "Payout berhasil dikirim",
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  },
  async rejectPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const { payoutId } = req.params;
      const result = await payoutService.rejectPayout(payoutId);
      res.status(200).json({
        status: "success",
        message: "Payout berhasil ditolak",
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  },
};
