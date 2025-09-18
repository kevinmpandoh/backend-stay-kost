import { NextFunction, Request, Response } from "express";
import { chatService } from "./chat.service";

export const chatController = {
  startChat: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const { roomTypeId, tenantId } = req.body;

      const chatRoom = await chatService.startChat({
        userId,
        roomTypeId,
        tenantId,
      });
      res.status(200).json({ status: "success", data: chatRoom });
    } catch (error) {
      next(error);
    }
  },

  sendMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user.id;
      const chatRoomId = req.params.chatRoomId;
      const { message } = req.body;
      const newMessage = await chatService.sendMessage(
        senderId,
        chatRoomId,
        message
      );

      res.status(201).json({ status: "success", data: newMessage });
    } catch (error) {
      next(error);
    }
  },

  getChatMessages: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const { chatRoomId } = req.params;
      const messages = await chatService.getMessages(user, chatRoomId);

      res.status(200).json({ status: "success", data: messages });
    } catch (error) {
      next(error);
    }
  },

  getChatRooms: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const messages = await chatService.getChatList(user);

      res.status(200).json({ status: "success", data: messages });
    } catch (error) {
      next(error);
    }
  },

  getChatOwner: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user.id;
      const { roomTypeId, tenantId } = req.params;
      const messages = await chatService.getChatOwner(
        ownerId,
        roomTypeId,
        tenantId
      );

      res.status(200).json({ status: "success", data: messages });
    } catch (error) {
      next(error);
    }
  },
};
