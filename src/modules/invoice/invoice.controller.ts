import { NextFunction, Request, Response } from "express";
import invoiceService from "./invoice.service";

export const invoiceController = {
  async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceNumber } = req.params;
      const userId = req.user.id;

      const result = await invoiceService.getInvoice(invoiceNumber, userId);
      res.status(200).json({
        status: "success",
        message: "Berhasil mendapatkan data invoice",
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  },
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const { invoiceNumber } = req.params;
      const paymentResponse = await invoiceService.createPayment(
        invoiceNumber,
        userId,
        req.body
      );
      res.status(200).json({ status: "success", data: paymentResponse });
    } catch (error) {
      next(error);
    }
  },
};
