import { NextFunction, Request, Response } from "express";
import { PaymentService } from "./payment.service";

export const PaymentController = {
  async getAllPaymentTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;
      const result = await PaymentService.getAllPaymentTenant(tenantId);
      res.status(201).json({
        message: "Berhasil mendapatkan pembayaran penyewa",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const { paymentId } = req.params;
      const result = await PaymentService.checkStatus(paymentId, userId);
      res.status(200).json({
        status: "success",
        message: "Payment method updated",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async changePaymentMethod(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const { paymentId } = req.params;
      const result = await PaymentService.changePaymentMethod(
        userId,
        paymentId,
        req.body
      );
      res.status(200).json({ message: "Payment method updated", data: result });
    } catch (error) {
      next(error);
    }
  },

  async handleMidtransCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await PaymentService.handleMidtransCallback(req.body);
      res.status(200).json({ message: "Notification processed" });
    } catch (error) {
      next(error);
    }
  },
};
