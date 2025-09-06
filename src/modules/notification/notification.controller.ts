import { NextFunction, Request, Response } from "express";
import { notificationService } from "../../modules/notification/notification.service";

export const NotificationController = {
  getNotifications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, page = "1", limit = "20" } = req.query;
      const notifications = await notificationService.getUserNotifications(
        req.user.id,
        req.user.role,
        type as string,
        parseInt(page as string),
        parseInt(limit as string)
      );
      res.json({ status: "success", data: notifications });
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      res.json({ status: "success", data: notification });
    } catch (error) {
      next(error);
    }
  },

  markAllAsRead: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      await notificationService.markAllAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error updating notifications", error });
    }
  },

  deleteNotification: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await notificationService.deleteNotification(id);
      res.json({ message: "Notification deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting notification", error });
    }
  },
};
