import { NextFunction, Request, Response } from "express";
import { subscriptionService } from "./subscription.service";

class SubscriptionController {
  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user.id; // dari auth middleware
      const { packageId } = req.body;

      const subscription = await subscriptionService.createSubscription(
        ownerId,
        packageId
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

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const subs = await subscriptionService.getAll();
      res.json({ success: true, data: subs });
    } catch (err) {
      next(err);
    }
  }
}

export const subscriptionController = new SubscriptionController();
