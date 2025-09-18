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

  async getOwnerInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const billings = await invoiceService.getOwnerInvoices(req);
      res.status(200).json({ status: "success", data: billings });
    } catch (error) {
      next(error);
    }
  },

  async getAdminInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, month } = req.query;

      const invoices = await invoiceService.getAdminInvoices({
        status,
        search,
        month,
      });
      res.status(200).json({ status: "success", data: invoices });
    } catch (error) {
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
