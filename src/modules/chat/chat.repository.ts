import { BaseRepository } from "@/core/base.repository";
import { Chat, IChat } from "./chat.model";
import { IMessage, Message } from "./message.model";
import { FilterQuery, Types } from "mongoose";

export class ChatRepository extends BaseRepository<IChat> {
  constructor() {
    super(Chat);
  }

  async findByParticipants(userIds: string[]) {
    return Chat.findOne({ participants: { $all: userIds } }).lean();
  }

  async createMessage(
    chatRoomId: string,
    senderId: string,
    receiverId: string,
    message: string
  ) {
    return await Message.create({
      chatRoom: chatRoomId,
      sender: senderId,
      receiver: receiverId,
      message,
    });
  }

  async markAsRead(chatRoom: string, userId: string) {
    return await Message.updateMany(
      { chatRoom, sender: { $ne: userId }, isRead: false },
      { isRead: true }
    );
  }

  async findMessages(filter: FilterQuery<IMessage> = {}) {
    return await Message.find(filter);
  }

  async findChatRooms(filter: FilterQuery<any> = {}): Promise<any> {
    return await Chat.find(filter)
      .populate([
        {
          path: "roomType",
          select: "name",
          populate: [
            {
              path: "kost",
              select: "name",
            },
            {
              path: "photos",
              select: "url",
            },
          ],
        },
        {
          path: "tenant",
          select: "name",
        },
        {
          path: "owner",
          select: "name",
        },
      ])
      .sort({ lastMessageAt: -1 });
  }

  async findMessagesByChatRoom(chatRoomId: string) {
    return await Message.aggregate([
      { $match: { chatRoom: new Types.ObjectId(chatRoomId) } },
      { $sort: { createdAt: 1 } },
      // Lookup sender
      {
        $lookup: {
          from: "tenants",
          localField: "sender",
          foreignField: "_id",
          as: "senderTenant",
        },
      },
      {
        $lookup: {
          from: "owners",
          localField: "sender",
          foreignField: "_id",
          as: "senderOwner",
        },
      },
      {
        $addFields: {
          senderData: { $concatArrays: ["$senderTenant", "$senderOwner"] },
        },
      },
      // Lookup receiver
      {
        $lookup: {
          from: "tenants",
          localField: "receiver",
          foreignField: "_id",
          as: "receiverTenant",
        },
      },
      {
        $lookup: {
          from: "owners",
          localField: "receiver",
          foreignField: "_id",
          as: "receiverOwner",
        },
      },
      {
        $addFields: {
          receiverData: {
            $concatArrays: ["$receiverTenant", "$receiverOwner"],
          },
        },
      },
      // Unwind result arrays
      { $unwind: { path: "$senderData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$receiverData", preserveNullAndEmptyArrays: true } },
      // Project the final fields
      {
        $project: {
          _id: 1,
          chatRoom: 1,
          sender: 1,
          receiver: 1,
          senderName: "$senderData.name",
          receiverName: "$receiverData.name",
          role: {
            $cond: {
              if: { $gt: [{ $size: "$senderTenant" }, 0] },
              then: "tenant",
              else: "owner",
            },
          },
          message: 1,
          isRead: 1,
          createdAt: 1,
        },
      },
    ]);
  }
}

export const chatRepository = new ChatRepository();
