import express from "express";
import { NotificationController } from "../../modules/notification/notification.controller";
import { auth } from "@/middlewares/auth.middleware";

const router = express.Router();

router.use(auth);
router.get("/", NotificationController.getNotifications);
router.put("/read-all", NotificationController.markAllAsRead);
router.put("/:id/read", NotificationController.markAsRead);
router.delete("/:id", NotificationController.deleteNotification);
export default router;
