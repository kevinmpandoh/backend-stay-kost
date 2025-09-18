import { NextFunction, Request, Response } from "express";
import { subscriptionService } from "./subscription.service";

class SubscriptionController {
  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user.id; // dari auth middleware
      const { packageId, duration } = req.body;

      const subscription = await subscriptionService.createSubscription(
        ownerId,
        packageId,
        duration
      );

      return res.status(201).json({
        status: "success",
        message: "Subscription created, invoice generated",
        data: subscription,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMySubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user.id;

      const subscription = await subscriptionService.getMySubscription(ownerId);

      res.json({ success: true, data: subscription });
    } catch (err) {
      next(err);
    }
  }

  async getCurrentSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const ownerId = req.user.id;
      const current = await subscriptionService.getCurrentSubscription(ownerId);

      res.json({ success: true, data: current });
    } catch (err) {
      next(err);
    }
  }

  async renewSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user.id;
      const { subscriptionId } = req.params;
      const { duration } = req.body;

      const newSub = await subscriptionService.renewSubscription(
        ownerId,
        subscriptionId,
        duration
      );

      res.status(201).json({
        success: true,
        message: "Subscription renewed",
        data: newSub,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const subs = await subscriptionService.getAll();
      res.json({ success: true, data: subs });
    } catch (err) {
      next(err);
    }
  }
  async cancelSubscriptionInvoice(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const ownerId = req.user.id;
      const { invoiceId } = req.params;
      const sub = await subscriptionService.cancelSubscriptionInvoice({
        ownerId,
        invoiceId,
      });
      res.json({ success: true, message: "Subscription canceled", data: sub });
    } catch (err) {
      next(err);
    }
  }

  async getSubscriptionInvoices(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const ownerId = req.user.id;
      const invoices = await subscriptionService.getSubscriptionInvoices(
        ownerId
      );
      res.json({ success: true, data: invoices });
    } catch (err) {
      next(err);
    }
  }
}

export const subscriptionController = new SubscriptionController();
