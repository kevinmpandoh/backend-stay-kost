import { getReceiverSocketId, io } from "@/socket";
import { notificationRepository } from "./notification.repository";

export const notificationService = {
  sendNotification: async (
    userId: string,
    role: "owner" | "tenant" | "admin",
    type: "chat" | "booking" | "payment" | "subscription" | "payout" | "system",
    message: string,
    title?: string,
    metadata?: Record<string, any>
  ) => {
    const notif = await notificationRepository.create({
      user: userId,
      role,
      type,
      message,
      title,
      metadata,
    });

    // 2️⃣ Kirim realtime ke user via socket
    const socketId = getReceiverSocketId(userId.toString());
    if (socketId) {
      io.to(socketId).emit("newNotification", {
        id: notif._id,
        type,
        title,
        message,
        metadata,
        createdAt: notif.createdAt,
      });
    }

    return notif;
  },

  getUserNotifications: async (
    userId: string,
    role: string,
    type?: string,
    page: number = 1,
    limit: number = 20
  ) => {
    return await notificationRepository.findAll(
      { user: userId, role },
      {
        sort: { createdAt: -1 },
      }
    );
  },

  markAsRead: async (notificationId: string) => {
    return await notificationRepository.updateById(notificationId, {
      isRead: true,
      isReadAt: new Date(),
    });
  },

  markAllAsRead: async (userId: string) => {
    return await notificationRepository.update(
      { user: userId, isRead: false },
      { isRead: true, isReadAt: new Date() }
    );
  },

  deleteNotification: async (id: string) => {
    return await notificationRepository.deleteById(id);
  },
};
