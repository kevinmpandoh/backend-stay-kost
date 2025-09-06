import { ResponseError } from "@/utils/response-error.utils";
import { roomTypeRepository } from "../room-type/room-type.repository";
import { userRepository } from "../user/user.repository";
import { chatRepository } from "./chat.repository";
import { getReceiverSocketId, io } from "@/socket";

export const chatService = {
  startChat: async (tenantId: string, roomTypeId: string) => {
    const tenant = await userRepository.findById(tenantId);
    const roomType = (await roomTypeRepository.findById(roomTypeId, [
      {
        path: "kost",
        select: "owner",
      },
    ])) as any;

    if (!tenant)
      throw new ResponseError(404, "Anda harus login sebagai penyewa");
    if (!roomType) throw new ResponseError(404, "KOST Tidak ditemukan");

    let chatRoom = await chatRepository.findOne({
      tenant: tenantId,
      roomType: roomTypeId,
    });

    if (!chatRoom) {
      chatRoom = await chatRepository.create({
        tenant: tenantId,
        owner: roomType.kost.owner,
        roomType: roomTypeId,
      });
    }

    return chatRoom;
  },

  sendMessage: async (
    senderId: string,
    chatRoomId: string,
    message: string
  ) => {
    const chatRoom = await chatRepository.findById(chatRoomId);
    if (!chatRoom) {
      throw new ResponseError(404, "Chat room tidak ditemukan");
    }

    if (
      chatRoom.tenant.toString() !== senderId &&
      chatRoom.owner.toString() !== senderId
    ) {
      throw new ResponseError(
        403,
        "Kamu tidak memiliki akses ke ruang chat ini"
      );
    }

    const receiverId =
      chatRoom.tenant.toString() === senderId
        ? chatRoom.owner
        : chatRoom.tenant;

    // ✅ Update last message di chat room
    await chatRepository.updateById(chatRoomId, {
      lastMessage: message,
      lastMessageAt: new Date(),
    });

    const newMessage = await chatRepository.createMessage(
      chatRoomId,
      senderId,
      receiverId.toString(),
      message
    );

    io.to(chatRoomId).emit("receiveMessage", {
      id: newMessage._id,
      text: message,
      senderId: senderId,
      createdAt: newMessage.createdAt,
    });

    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", {
        message: "Ini Pesan Baru",
      });
    }

    return newMessage;
  },

  getMessages: async (
    user: {
      id: string;
      role: string;
    },
    chatRoomId: string
  ) => {
    const userId = user.id;
    const userRole = user.role;

    const messages = await chatRepository.findMessagesByChatRoom(chatRoomId);

    if (!messages) throw new ResponseError(404, "Pesan tidak ditemukan");

    await chatRepository.markAsRead(chatRoomId, userId);
    const chatRoom = (await chatRepository.findById(chatRoomId, [
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
    ])) as any;

    const sender = userRole === "tenant" ? chatRoom?.owner : chatRoom?.tenant;

    return {
      namaKost: `${chatRoom?.roomType.kost.name} - ${chatRoom?.roomType.name}`,
      photo: chatRoom?.roomType.photos[0].url,
      sender: {
        name: sender.name,
        avatar: sender.avatar || null,
      },
      messages: messages.map((message: any) => {
        return {
          id: message._id,
          text: message.message,
          senderId: message.sender.toString(),
          senderName: message.senderName,
          createdAt: message.createdAt,
        };
      }),
    };
  },
  getChatList: async (user: { id: string; role: string }) => {
    const userId = user.id;
    const userRole = user.role;
    const chatRooms = await chatRepository.findChatRooms({
      $or: [{ penyewa: userId }, { pemilik: userId }],
    });

    if (!chatRooms) throw new ResponseError(404, "Chat Room tidak ada");

    // ✅ Hitung jumlah pesan belum dibaca untuk setiap chat room
    const chatList = await Promise.all(
      chatRooms.map(async (chat: any) => {
        const seender = userRole === "tenant" ? chat.pemilik : chat.penyewa;

        const unreadMessages = await chatRepository.findMessages({
          chatRoom: chat._id,
          sender: { $ne: userId }, // Hanya hitung pesan dari lawan bicara
          isRead: false,
        });

        return {
          id: chat._id,
          kost: {
            namaKost: `${chat.tipe_kost.nama_tipe} - ${chat.tipe_kost.kost.nama_kost}`,
            fotoKost: chat.tipe_kost.photos[0].url || null,
          },
          tenant: {
            name: chat.penyewa.name,
          },
          sender: {
            id: chat.penyewa._id,
            name: chat.penyewa.name,
            role: userRole,
          },
          last_message: chat.lastMessage,
          last_message_at: chat.lastMessageAt,
          unread_messages: unreadMessages.length, // ✅ Jumlah pesan belum dibaca
        };
      })
    );

    return chatList;
  },
};
