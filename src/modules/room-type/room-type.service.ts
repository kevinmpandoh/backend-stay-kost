import { ResponseError } from "@/utils/response-error.utils";
import { KostRepository, kostRepository } from "../kost/kost.repository";
import { roomTypeRepository } from "./room-type.repository";
import { roomRepository, RoomRepository } from "../room/room.repository";
import { KostStatus, KostType } from "../kost/kost.type";
import { RoomInput, RoomStatus } from "../room/room.type";
import { bookingRepository } from "../booking/booking.repository";
import { BookingStatus } from "../booking/booking.types";
import { photoRoomRepository } from "../photo-room/photo-room.repository";

import { createRoomTypePayload, RoomTypeStatus } from "./room-type.type";
import { PhotoRoomCategory } from "../photo-room/photo-room.model";
import { IRoomType } from "./room-type.model";
import { notificationRepository } from "../notification/notification.repository";
import { notificationService } from "../notification/notification.service";
import { subscriptionRepository } from "../subscription/subscription.repository";

export const RoomTypeService = {
  async getKostTypeOwner(roomTypeId: string) {
    const roomType = (await roomTypeRepository.findById(roomTypeId, [
      {
        path: "rooms",
      },
    ])) as IRoomType;

    if (!roomType) throw new ResponseError(404, "Kost Type Not Found");

    return {
      id: roomType._id,
      kostId: roomType.kost,
      progressStep: roomType.progressStep,
      status: roomType.status,
      nama_tipe: roomType.name,
      ukuran_kamar: roomType.size,

      jumlah_kamar: roomType.rooms?.length ?? 0,
      kamar_terisi: roomType.rooms?.filter(
        (room: any) => room.status === RoomStatus.OCCUPIED
      ).length,
      kamar_kosong: roomType.rooms?.filter(
        (room: any) => room.status === RoomStatus.AVAILABLE
      ).length,
      fasilitas: roomType.facilities.map((f: any) => f._id),
      harga: roomType.price,
    };
  },
  async createKostType(data: createRoomTypePayload) {
    const kost = await kostRepository.findById(data.kost);

    if (!kost) throw new ResponseError(404, "Kost tidak ditemukan");

    const roomType = await roomTypeRepository.create({
      ...data,
      status: KostStatus.DRAFT,
      progressStep: 1,
    });

    // ✅ Gunakan RoomInput (plain object, no _id)
    const rooms: RoomInput[] = [];
    for (let i = 1; i <= data.total_rooms; i++) {
      rooms.push({
        roomType: roomType._id,
        number: `Kamar ${i}`,
        floor: Math.ceil(i / 10),
        status:
          i <= data.total_rooms_occupied
            ? RoomStatus.OCCUPIED
            : RoomStatus.AVAILABLE,
      });
    }

    // ✅ Tidak error lagi
    const savedRooms = await roomRepository.createMany(rooms);
    const roomIds = savedRooms.map((room) => room._id);
    await roomTypeRepository.updateById(roomType._id, {
      rooms: roomIds,
    });

    await kostRepository.updateById(kost._id, {
      $push: {
        roomTypes: roomType._id,
      },
    });

    if (kost.status === KostStatus.DRAFT) {
      await kostRepository.updateById(kost._id, {
        progressStep: 6,
      });
    }

    return {
      kost: kost._id,
      roomTypeId: roomType._id,
      kostStatus: kost.status,
    };
  },

  async update(roomTypeId: string, ownerId: string, data: any) {
    const roomType = (await roomTypeRepository.findById(roomTypeId, [
      { path: "kost" },
    ])) as any;
    if (!roomType) {
      throw new ResponseError(404, "Tipe Kost tidak ditemukan");
    }

    await roomTypeRepository.updateById(roomTypeId, {
      ...data,
    });

    await roomRepository.deleteMany({
      roomType: roomTypeId,
    });

    const rooms: RoomInput[] = [];
    for (let i = 1; i <= data.total_rooms; i++) {
      rooms.push({
        roomType: roomTypeId,
        number: `Kamar ${i}`,
        floor: Math.ceil(i / 10), // Misalnya setiap 10 kamar pindah lantai
        status:
          i <= data.total_rooms_occupied
            ? RoomStatus.OCCUPIED
            : RoomStatus.AVAILABLE,
      });
    }

    // Simpan semua kamar ke database
    const savedRooms = await roomRepository.createMany(rooms);

    const roomIds = savedRooms.map((room) => room._id);

    await roomTypeRepository.updateById(roomType._id, {
      rooms: roomIds,
    });

    return {
      kostId: roomType.kost._id,
      roomTypeId: roomType?._id,
      kostStatus: roomType.kost.status,
      roomTypeStatus: roomType.status,
    };
  },

  async updateFacilities(roomTypeId: string, payload: any) {
    const roomType = (await roomTypeRepository.findById(roomTypeId, [
      {
        path: "kost",
      },
    ])) as any;

    if (!roomType) throw new ResponseError(404, "Tipe Kamar tidak ditemukan");

    const newRoomType = await roomTypeRepository.updateById(roomTypeId, {
      facilities: payload.facilities,
      progressStep: 3,
    });

    if (roomType.kost.status === KostStatus.DRAFT) {
      await kostRepository.updateById(roomType.kost._id, {
        progressStep: 7,
      });
    }

    return {
      kostId: roomType.kost._id,
      roomTypeId,
      kostStatus: roomType.kost.status,
      facilities: newRoomType?.facilities,
    };
  },

  async updatePhotoRoom(roomTypeId: string, payload: any) {
    const roomType = (await roomTypeRepository.findById(roomTypeId, [
      {
        path: "kost",
      },
    ])) as any;
    if (!roomType) throw new ResponseError(404, "Kost tidak ditemukan");

    const categories = [PhotoRoomCategory.INSIDE_ROOM];

    const photoCounts = await Promise.all(
      categories.map(async (category) => {
        return {
          category,
          count: await photoRoomRepository.count({
            roomType: roomTypeId,
            category,
          }),
        };
      })
    );

    const missingCategories = photoCounts.filter((p) => p.count < 1);

    if (missingCategories.length > 0) {
      const errorDetails: Record<string, string> = {};
      missingCategories.forEach((m) => {
        errorDetails[
          m.category
        ] = `Minimal 1 foto untuk kategori '${m.category}' diperlukan`;
      });

      throw new ResponseError(
        400,
        "Beberapa kategori foto kamar belum lengkap",
        errorDetails
      );
    }

    await roomTypeRepository.updateById(roomTypeId, {
      progressStep: 4,
    });

    if (
      roomType.kost.status === KostStatus.DRAFT &&
      roomType.kost.progressStep < 8
    ) {
      await kostRepository.updateById(roomType.kost._id, {
        progressStep: 8,
      });
    }

    return {
      kostId: roomType.kost._id.toString(),
      kostStatus: roomType.kost.status,
      roomTypeId: roomType._id.toString(),
    };
  },

  async updatePrice(roomTypeId: string, payload: any, ownerId: string) {
    const roomType = (await roomTypeRepository.findById(roomTypeId, [
      {
        path: "kost",
        select: "isPublished status",
      },
    ])) as any;
    if (!roomType) throw new ResponseError(404, "Tipe kost tidak ditemukan");

    await roomTypeRepository.updateById(roomTypeId, {
      price: payload.price,
      status: RoomTypeStatus.ACTIVE,
    });

    if (!roomType.kost?.isPublished) {
      const subscription = (await subscriptionRepository.findOne(
        {
          owner: ownerId,
          status: "active",
        },
        [
          {
            path: "package",
          },
        ]
      )) as any;

      if (!subscription) {
        throw new ResponseError(
          404,
          "Anda belum memiliki paket langganan Aktif"
        );
      }

      if (subscription.endDate && subscription.endDate < new Date()) {
        throw new ResponseError(404, "Paket langganan Anda sudah expired");
      }

      if (subscription.package.maxKost) {
        const countKost = await kostRepository.count({
          owner: ownerId,
          isPublished: true,
        });
        if (countKost >= subscription.package.maxKost) {
          throw new ResponseError(
            404,
            `Paket Anda hanya bisa menambahkan ${subscription.package.maxKost} kost.  Upgrade paket untuk menambahkan lagi.`
          );
        }
      }
      await kostRepository.updateById(roomType.kost._id.toString(), {
        status: KostStatus.PENDING,
      });

      // await notificationService.sendNotification(
      //   toRole: "admin",
      //   title: "Pengajuan Kost Baru",
      //   message: `Kost baru dengan tipe kamar '${roomType.name}' telah diajukan untuk dipublikasikan.`,
      //   data: {
      //     kostId: roomType.kost._id.toString(),
      //     roomTypeId: roomType._id.toString(),
      //   },
      // );
    }

    return roomType;
  },

  async delete(roomTypeId: string) {
    const booking = await bookingRepository.findAll({
      roomType: roomTypeId,
      status: {
        $in: [
          BookingStatus.WAITING_FOR_CHECKOUT,
          BookingStatus.ACTIVE,
          BookingStatus.WAITING_FOR_PAYMENT,
          BookingStatus.WAITING_FOR_CHECKIN,
        ],
      },
    });

    if (booking.length > 0)
      throw new ResponseError(403, "Masih ada sewa yang aktif");

    const tes = await roomTypeRepository.deleteById(roomTypeId);
    await roomRepository.deleteMany({ roomType: roomTypeId });

    await photoRoomRepository.deleteMany({
      roomType: roomTypeId,
    });
  },
};
