import { ResponseError } from "@/utils/response-error.utils";
import { kostRepository } from "./kost.repository";
import { Address, createKost, KostStatus } from "./kost.type";
import { roomTypeRepository } from "../room-type/room-type.repository";
import mongoose from "mongoose";
import { IPhotoKost, PhotoCategory } from "../photo-kost/photo-kost.model";
import { photoKostRepository } from "../photo-kost/photo-kost.repository";

import { roomRepository } from "../room/room.repository";
import { RoomInput, RoomStatus } from "../room/room.type";
import { RoomTypeStatus } from "../room-type/room-type.type";

import { PhotoRoomCategory } from "../photo-room/photo-room.model";

import { reviewRepository } from "../review/review.repository";
import { subscriptionRepository } from "../subscription/subscription.repository";
import { bookingRepository } from "../booking/booking.repository";
import { BookingStatus } from "../booking/booking.types";

const getAll = async (query: any) => {
  // return await kostRepository.findRoomTypesWithFilters(query);
  const kostFacilities = query.kostFacilities?.split(",") ?? [];
  const roomFacilities = query.roomFacilities?.split(",") ?? [];
  const rules = query.rules?.split(",") ?? [];
  const kostType = query.kostType?.split(",") ?? [];

  const result = await kostRepository.findRoomTypesWithFilters({
    ...query,
    kostType,
    kostFacilities,
    roomFacilities,
    rules,
  });

  const data = await Promise.all(
    result.docs.map(async (kost: any) => {
      const roomTypes = kost.roomTypes;

      // urutkan foto
      const sortedTypePhotos = [...roomTypes.photos].sort((a: any, b: any) => {
        if (
          a.category === PhotoRoomCategory.INSIDE_ROOM &&
          b.category !== PhotoRoomCategory.INSIDE_ROOM
        )
          return -1;
        if (
          a.category !== PhotoRoomCategory.INSIDE_ROOM &&
          b.category === PhotoRoomCategory.INSIDE_ROOM
        )
          return 1;
        return 0;
      });

      const typePhotoUrls = sortedTypePhotos.map((photo: any) => photo.url);
      const kostPhotoUrls = kost.photos.map((photo: any) => photo.url) ?? [];
      const allPhotos = [...typePhotoUrls, ...kostPhotoUrls];

      const availableRooms = roomTypes.rooms.filter(
        (room: any) => room.status === RoomStatus.AVAILABLE
      ).length;

      // ✅ Hitung rata-rata rating
      const reviews = roomTypes.reviews ?? [];
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
            reviews.length
          : 0;

      // ✅ Hitung total transaksi
      const totalTransactions = await bookingRepository.count({
        roomType: roomTypes._id,
        status: BookingStatus.COMPLETED,
      });

      return {
        id: roomTypes._id,
        name: `${kost.name} ${roomTypes.name}`,
        address: `${kost.address.district}, ${kost.address.city}`,
        type: kost.type,
        price: roomTypes.price,
        facilities: roomTypes.facilities.map((f: any) => f.name),
        photos: allPhotos,
        availableRooms,
        rating: averageRating,
        transactions: totalTransactions,
      };
    })
  );

  return {
    data,
    pagination: {
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  };
};

const getKostById = async (kostId: string) => {
  const kost = await kostRepository.findById(kostId, [
    {
      path: "owner",
    },
    {
      path: "facilities",
    },
    {
      path: "photos",
    },
    {
      path: "rules",
    },
  ]);

  if (!kost) throw new ResponseError(404, "Kost not found");
  return kost;
};

const getDetailKostPublic = async (roomTypeId: string) => {
  //  const kostTypeId = req.params.kostTypeId;

  const roomType = (await roomTypeRepository.findById(roomTypeId, [
    {
      path: "photos",
    },
    {
      path: "facilities",
    },
    {
      path: "rooms",
    },
  ])) as any;

  if (!roomType) {
    throw new ResponseError(404, "Tipe Kost tidak ditemukan");
  }

  const kost = (await kostRepository.findById(roomType.kost._id, [
    {
      path: "rules",
    },
    {
      path: "photos",
    },
    {
      path: "facilities",
    },
    {
      path: "owner",
    },
  ])) as any;

  const otherRoomTypes = await roomTypeRepository.findAll(
    {
      kost: kost._id,
      _id: { $ne: roomTypeId },
      status: RoomTypeStatus.ACTIVE,
    },
    {},
    [
      {
        path: "photos",
      },
      {
        path: "facilities",
      },
      {
        path: "rooms",
      },
    ]
  );

  const reviews = await reviewRepository.findAll(
    {
      roomType: roomTypeId,
    },
    {},
    [{ path: "tenant" }]
  );

  const allPhotos = [...roomType.photos, ...kost.photos];

  const nearbyKosts = await kostRepository.getNearbyKost(
    kost._id,
    kost.address.coordinates.coordinates
  );

  const availableRooms = roomType.rooms.filter(
    (room: any) => room.status === RoomStatus.AVAILABLE
  ).length;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        reviews.length
      : 0;

  return {
    // ...kostType.toObject(), // Jika menggunakan Mongoose, konversi ke objek biasa
    id: roomType._id,
    reviews: reviews.map((review: any) => ({
      id: review._id,
      name: review.tenant.name,
      avatar: review.tenant.foto_profil,
      rating: review.rating,
      message: review.comment,
      reply: review.reply,
      createdAt: review.createdAt,
    })),
    averageRating,
    availableRooms,
    photos: allPhotos,
    name: `${kost.name} ${roomType.name}`,
    description: kost.description,
    price: roomType.price,
    type: kost.type,
    rules: kost.rules.map((rule: any) => rule.name),
    roomFacilities: roomType.facilities.map((f: any) => f.name),
    kostFacilities: kost.facilities.map((f: any) => f.name),
    address: kost.address,
    owner: {
      name: kost.owner.name,
      avatar: kost.owner.avatarUrl,
    },
    otherKostTypes: otherRoomTypes.map((type: any) => ({
      id: type._id,
      name: type.name,
      price: type.price,
      photos: type.photos.map((photo: any) => photo.url),
      facilities: type.facilities.map((f: any) => f.name),
      remaining: type.rooms.filter(
        (room: any) => room.status === RoomStatus.AVAILABLE
      ).length,
      size: type.size,
    })),
    nearbyKosts: nearbyKosts.map((kost: any) => ({
      id: kost.id,
      name: kost.name,
      address: kost.address,
      type: kost.type,
      price: kost.price,
      facilities: kost.facilities,
      photo: kost.photos,
      rooms: kost.rooms.filter(
        (room: any) => room.status === RoomStatus.AVAILABLE
      ).length,
      rating: kost.rating,
    })),
  };
};

const listOwner = async (ownerId: string) => {
  const kosts = await kostRepository.findAll({ owner: ownerId }, {}, [
    {
      path: "facilities",
    },
    {
      path: "photos",
    },
    {
      path: "roomTypes",
      populate: "rooms",
    },
  ]);

  const formatted = await Promise.all(
    kosts.map(async (kost: any) => {
      const kamarSummary = await roomRepository.findAll({ kost: kost._id });

      return {
        id: kost._id,
        photo: kost?.photos?.[0]?.url || null,
        name: kost?.name,
        type: kost?.type,
        address: kost.address
          ? `${kost?.address?.district}, ${kost?.address?.city}`
          : null,
        status: kost.status,
        progressStep: kost.progressStep,
        rejectionReason: kost.rejectionReason,
        roomTypeName: kost.roomTypes?.map((k: any) => k.name),
        rating: 0,
        fasilitas: kost.facilities?.map((f: any) => f.name),
        isPublished: kost.isPublished,
        ...kamarSummary,
      };
    })
  );

  return formatted;
};

const createKost = async (ownerId: string, data: createKost) => {
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
    throw new ResponseError(404, "Anda belum memiliki paket langganan Aktif");
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
        `Paket Anda hanya bisa menambahkan ${subscription.package.maxKost} kost`
      );
    }
  }

  const isTaken = await kostRepository.isNameTaken(data.name, ownerId);
  if (isTaken)
    throw new ResponseError(400, "Nama kost sudah digunakan di kost lain");

  // Simpan ke database
  const kost = await kostRepository.create({
    ...data,
    owner: ownerId,
    progressStep: 2,
  });

  return kost;
};

const getDetailOwnerKost = async (ownerId: string, kostId: string) => {
  const kost = await kostRepository.findById(kostId, [
    {
      path: "roomTypes",
      populate: "facilities rooms photos",
    },
    {
      path: "rules",
    },
    {
      path: "facilities",
    },
  ]);
  if (!kost) throw new ResponseError(404, "Kost Not Found");

  // Ambil semua _id tipe kost
  const kostTypeIds = kost.roomTypes.map((kt: any) => kt._id);

  // Ambil semua review untuk tipe-tipe kost tersebut
  const allReviews = await reviewRepository.findAll({
    kost_type: { $in: kostTypeIds },
  });

  // Kelompokkan dan hitung total + average rating per kost_type
  const reviewStatsMap = new Map<string, { total: number; sum: number }>();
  for (const review of allReviews) {
    const key = review.roomType.toString();
    const current = reviewStatsMap.get(key) || { total: 0, sum: 0 };
    current.total += 1;
    current.sum += review.rating;
    reviewStatsMap.set(key, current);
  }

  // Susun data tipe_kost lengkap dengan stats review
  const roomTypes = kost.roomTypes.map((roomType: any) => {
    const stats = reviewStatsMap.get(roomType._id.toString()) || {
      total: 0,
      sum: 0,
    };
    const averageRating = stats.total > 0 ? stats.sum / stats.total : null;

    return {
      id: roomType._id,
      nama_tipe: roomType.name,
      progress_step: roomType.progressStep,
      harga: roomType.price,
      status: roomType.status,
      ukuran_kamar: roomType.size,
      total_kamar: roomType.rooms.length,
      // kamar_tersedia: roomType.kamar_tersedia,
      fasilitas: roomType.facilities.map((f: any) => ({
        id: f._id,
        nama: f.name,
      })),
      foto: roomType.photos.map((p: any) => ({
        id: p._id,
        url: p.url,
        tipe: p.tipe,
      })),
      rooms: roomType.rooms,
      kamar_terisi: roomType.rooms.filter(
        (room: any) => room.status === RoomStatus.OCCUPIED
      ).length,
      kamar_kosong: roomType.rooms.filter(
        (room: any) => room.status === RoomStatus.AVAILABLE
      ).length,
      totalReview: stats.total,
      averageRating: averageRating?.toFixed(2),
    };
  });

  return {
    id: kost._id,
    progressStep: kost.progressStep,
    name: kost.name,
    type: kost.type,
    description: kost.description,
    rules: kost.rules,
    address: kost.address,
    kostFacilities: kost.facilities,
    photoKost: kost.photos,
    roomTypes,
  };
};

const updateKost = async (
  kostId: string,
  ownerId: string,
  data: createKost
) => {
  const kost = await kostRepository.findById(kostId);
  if (!kost) {
    throw new ResponseError(404, "Kost tidak ditemukan");
  }

  const isTaken = await kostRepository.isNameTaken(data.name, ownerId, kostId);

  if (isTaken)
    throw new ResponseError(400, "Nama kost sudah digunakan oleh Anda");

  const newKost = await kostRepository.updateById(kostId, data);

  if (kost.isPublished || kost.status === KostStatus.REJECTED) {
    return await kostRepository.updateById(kostId, {
      ...data,
      status: KostStatus.PENDING,
      rejectionReason: null,
    });
  }
  return newKost;
};

const updateAddress = async (kostId: string, addressData: Address) => {
  const kost = await kostRepository.findById(kostId);
  if (!kost) throw new ResponseError(404, "Kost not found");

  // siapkan koordinat GeoJSON
  let geoAddress: Address = {
    ...addressData,
  };
  if (
    (addressData as any).coordinates?.lat !== undefined &&
    (addressData as any).coordinates?.lng !== undefined
  ) {
    geoAddress.coordinates = {
      type: "Point",
      coordinates: [
        Number((addressData as any).coordinates.lng),
        Number((addressData as any).coordinates.lat),
      ],
    } as any;
  } else {
    // kalau tidak ada lat/lng → kosongkan
    geoAddress.coordinates = undefined as any;
  }

  if (kost.isPublished || kost.status === KostStatus.REJECTED) {
    return await kostRepository.updateById(kostId, {
      address: geoAddress,
      status: KostStatus.PENDING,
      rejectionReason: "",
    });
  }

  // Cek apakah address sudah ada sebelumnya
  const updatePayload: Partial<typeof kost> = {
    address: geoAddress,
  };

  if (!kost.address && kost.progressStep < 3) {
    updatePayload.progressStep = 3;
  }

  const updatedKost = await kostRepository.updateById(kostId, updatePayload);

  return updatedKost;
};

const updateFacilities = async (
  kostId: string,
  payload: { facilities: string[] }
) => {
  const kost = await kostRepository.findById(kostId);
  if (!kost) throw new ResponseError(404, "Kost tidak ditemukan");

  // kalau sudah publish / rejected → reset status
  if (kost.isPublished || kost.status === KostStatus.REJECTED) {
    return await kostRepository.updateById(kostId, {
      status: KostStatus.PENDING,
      rejectionReason: "",
    });
  }

  // default payload
  const updatePayload: Partial<typeof kost> = {
    facilities: payload.facilities,
  };

  // kalau progress masih di step 3 → lanjut ke step 4
  if (!kost.facilities?.length && kost.progressStep < 4) {
    updatePayload.progressStep = 4;
  }

  const updatedKost = await kostRepository.updateById(kostId, updatePayload);
  return updatedKost;
};

const updatePhotoKost = async (kostId: string) => {
  // Validasi data foto
  const kost = await kostRepository.findById(kostId);

  if (!kost) throw new ResponseError(404, "Kost tidak ditemukan");

  // 🚀 Cek jumlah foto per kategori
  const categories = [
    PhotoCategory.FRONT_VIEW,
    PhotoCategory.ROOM_VIEW,
    PhotoCategory.STREET_VIEW,
  ];
  const photoCounts = await Promise.all(
    categories.map(async (category) => {
      return {
        category,
        count: await photoKostRepository.count({ kost: kostId, category }),
      };
    })
  );

  // 🚨 Jika ada kategori yang kurang, beri error
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
      "Beberapa kategori foto belum lengkap",
      errorDetails
    );
  }
  if (kost.isPublished || kost.status === KostStatus.REJECTED) {
    await kostRepository.updateById(kostId, {
      status: KostStatus.PENDING,
      rejectionReason: "",
    });
  }

  // ✅ Update progressStep ke 4 kalau masih di step 3
  let updatePayload: any = {};
  if (kost.progressStep < 5) {
    updatePayload.progressStep = 5;
  }

  const updatedKost = await kostRepository.updateById(kostId, updatePayload);

  return {
    kostId: updatedKost?._id,
    progress_step: updatedKost?.progressStep,
  };
};

const updateRoomType = async (kostId: string, payload: any) => {
  const kost = await kostRepository.findById(kostId);
  if (!kost) throw new ResponseError(404, "Kost tidak ditemukan");

  const generateRooms = (roomTypeId: string) => {
    const rooms: RoomInput[] = [];
    for (let i = 1; i <= payload.total_rooms; i++) {
      rooms.push({
        roomType: roomTypeId,
        number: `Kamar ${i}`,
        floor: Math.ceil(i / 10),
        status:
          i <= payload.total_rooms_occupied
            ? RoomStatus.OCCUPIED
            : RoomStatus.AVAILABLE,
      });
    }
    return rooms;
  };

  let roomType;

  if (kost.roomTypes.length > 0 && kost.status === KostStatus.DRAFT) {
    // ✅ Update existing roomType (ambil roomType pertama misalnya)
    const existingRoomTypeId = kost.roomTypes[0]; // asumsi 1 kost 1 roomType

    roomType = await roomTypeRepository.updateById(existingRoomTypeId, {
      ...payload,
      kost: new mongoose.Types.ObjectId(kostId),
    });

    // Hapus rooms lama lalu buat ulang kalau jumlah berubah
    await roomRepository.deleteMany({ roomType: existingRoomTypeId });

    const rooms = generateRooms(existingRoomTypeId.toString());
    const newRooms = await roomRepository.createMany(rooms);
    // Update roomType dengan id rooms baru
    await roomTypeRepository.updateById(existingRoomTypeId, {
      $set: { rooms: newRooms.map((r) => r._id) },
    });
  } else {
    // ✅ Create new roomType
    roomType = await roomTypeRepository.create({
      ...payload,
      kost: new mongoose.Types.ObjectId(kostId),
      status: RoomTypeStatus.DRAFT,
    });

    const rooms = generateRooms(roomType._id.toString());
    const newRooms = await roomRepository.createMany(rooms);

    await kostRepository.updateById(kost._id, {
      $push: { roomTypes: roomType._id },
    });

    await roomTypeRepository.updateById(roomType._id, {
      $push: { rooms: { $each: newRooms.map((r) => r._id) } },
      progressStep: 2,
    });
  }

  // ✅ Update progress step kalau masih di bawah 6
  if (kost.progressStep < 6) {
    await kostRepository.updateById(kost._id, {
      progressStep: 6,
    });
  }

  return {
    kostId: kost._id,
    roomTypeId: roomType?._id,
    kostStatus: kost.status,
  };
};

const deleteKost = async (id: string) => {
  const kost = await kostRepository.deleteById(id);

  if (!kost) {
    throw new ResponseError(404, "Kost tidak ditemukan");
  }

  const roomTypes = await roomTypeRepository.findAll({ kost: id });

  if (roomTypes.length > 0)
    throw new ResponseError(403, "Masih ada tipe kost yang aktif");

  // await photoKostRepository.deleteMany({ kost: id });
};

const listAllPending = async () => {
  // Simpan ke database
  const kosts = await kostRepository.findAll(
    {
      status: KostStatus.PENDING,
    },
    {},
    [
      { path: "photos" },
      {
        path: "owner",
      },
      {
        path: "roomTypes",
        populate: "facilities rooms photos",
      },
    ]
  );

  const formatted = kosts.map((kost: any) => ({
    id: kost._id,
    name: kost.name,
    photo: kost.photos?.[0]?.url || null,
    type: kost.type,
    address: kost.address
      ? `${kost.address.district}, ${kost.address.city}`
      : null,
    createdAt: kost.createdAt,
    owner: kost.owner,
    roomTypes: kost.roomTypes,
    photos: kost.photos,
  }));

  return formatted;
};

const approve = async (kostId: string) => {
  const kost = await kostRepository.findById(kostId);
  if (!kost) throw new ResponseError(404, "Kost tidak ditemukan");

  if (kost.status !== KostStatus.PENDING)
    throw new ResponseError(400, "Status Kost harus 'Menunggu Verifikasi'");
  await kostRepository.updateById(kostId, {
    status: KostStatus.APPROVED,
    isPublished: true,
  });
};
const reject = async (kostId: string, rejectionReason: string) => {
  const kost = await kostRepository.findById(kostId);
  if (!kost) throw new ResponseError(404, "Kost tidak ditemukan");

  if (kost.status !== KostStatus.PENDING)
    throw new ResponseError(400, "Status Kost harus 'Menunggu Verifikasi'");
  await kostRepository.updateById(kostId, {
    status: KostStatus.REJECTED,
    rejectionReason,
  });
};

export default {
  getAll,
  listOwner,
  getKostById,
  createKost,
  updateKost,
  getDetailOwnerKost,
  getDetailKostPublic,
  updateAddress,
  updateFacilities,
  updatePhotoKost,
  updateRoomType,
  listAllPending,
  approve,
  reject,
  deleteKost,
};
