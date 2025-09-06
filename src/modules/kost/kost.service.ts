import { ResponseError } from "@/utils/response-error.utils";
import { kostRepository } from "./kost.repository";
import { Address, createKost, KostStatus } from "./kost.type";
import { roomTypeRepository } from "../room-type/room-type.repository";
import mongoose from "mongoose";
import { IPhotoKost, PhotoCategory } from "../photo-kost/photo-kost.model";
import { photoKostRepository } from "../photo-kost/photo-kost.repository";
import { IKost, Kost } from "./kost.model";
import { roomRepository } from "../room/room.repository";
import { RoomInput, RoomStatus } from "../room/room.type";
import { RoomTypeStatus } from "../room-type/room-type.type";
import { validate } from "node-cron";
import { IPhotoRoom, PhotoRoomCategory } from "../photo-room/photo-room.model";
import { IRoomType, RoomType } from "../room-type/room-type.model";
import { reviewRepository } from "../review/review.repository";
import { IReview } from "../review/review.model";
import { preferenceRepository } from "../preference/preference.repository";
import {
  getCosineSimilarity,
  getDistanceInMeters,
  getHaversineScore,
  getPriceScore,
  getTfIdfVectors,
} from "@/utils/contentBasedFiltering";
import { wishlistRepository } from "../wishlist/wishlist.repository";
import { IFacility } from "../facility/facility.model";
import { IRule } from "../rule/rule.model";

const getAll = async (query: any) => {
  // return await kostRepository.findRoomTypesWithFilters(query);
  const result = await kostRepository.findRoomTypesWithFilters(query);

  return {
    data: result.docs.map((kost: any) => {
      const roomTypes = kost.roomTypes;
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

      return {
        id: roomTypes._id,
        name: `${kost.name} ${roomTypes.name}`,
        address: `${kost.address.district}, ${kost.address.city}`,
        type: kost.type,
        price: roomTypes.price,
        facilities: roomTypes.facilities.map((f: any) => f.name),
        photos: allPhotos,
        availableRooms,
        rating: roomTypes.rating ?? 0,
      };
    }),
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

const getDetailKostPublic = async (roomTypeId: string) => {
  //  const kostTypeId = req.params.kostTypeId;

  const roomType = (await roomTypeRepository.findById(roomTypeId, [
    {
      path: "photos",
    },
    {
      path: "facilities",
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
  ])) as any;

  const otherKostTypes = await roomTypeRepository.findAll(
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
    ]
  );

  const reviews = await reviewRepository.findAll({
    roomType: roomTypeId,
  });

  const allPhotos = [...roomType.photos, ...kost.photos];

  const nearbyKosts = await kostRepository.getNearbyKost(
    kost._id,
    kost.address.coordinates.coordinates
  );

  console.log(roomType);

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
    photos: allPhotos,
    nama_kost: `${kost.name} ${roomType.name}`,
    description: kost.description,
    price: roomType.price,
    type: kost.type,
    rules: kost.rules.map((rule: any) => rule.name),
    roomFacilities: roomType.facilities.map((f: any) => f.name),
    kostFacilities: kost.facilities.map((f: any) => f.name),
    address: kost.address,
    owner: {
      name: kost.owner.name,
      avatar: kost.owner.foto_profil,
    },
    otherKostTypes: otherKostTypes.map((type: any) => ({
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
      nama_kost: kost.name,
      address: kost.address,
      type: kost.type,
      price: kost.price,
      facilities: kost.fasilitas,
      foto: kost.photos,
      roomAvailable: kost.roomAvailable,
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
    },
  ]);

  const formatted = await Promise.all(
    kosts.map(async (kost: any) => {
      const kamarSummary = await roomRepository.findAll({ kost: kost._id });

      return {
        id: kost._id,
        fotoKost: kost?.photos?.[0]?.url || null,
        name: kost?.name,
        type: kost?.type,
        address: kost.address
          ? `${kost?.address?.district}, ${kost?.address?.city}`
          : null,
        status: kost.status,
        progressStep: kost.progressStep,
        rejectionReason: kost.rejectionReason,
        nama_tipe: kost.roomTypes?.map((k: any) => k.name),
        rating: 0,
        fasilitas: kost.facilities?.map((f: any) => f.name),
        ...kamarSummary,
      };
    })
  );

  return formatted;
};

const createKost = async (ownerId: string, data: createKost) => {
  const isTaken = await kostRepository.isNameTaken(data.name, ownerId);
  if (isTaken)
    throw new ResponseError(400, "Nama kost sudah digunakan di kost lain");

  // Simpan ke database
  const kost = await kostRepository.create({ ...data, owner: ownerId });

  return kost;
};

const getDetailOwnerKost = async (ownerId: string, kostId: string) => {
  const kost = await kostRepository.findById(kostId, [
    {
      path: "roomTypes",
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
      // total_kamar: roomType.,
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
    deskripsi: kost.description,
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
      status: "Menunggu Verifikasi",
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

  console.log(addressData);

  // kalau client masih kirim { lat, lng } biasa → ubah ke GeoJSON
  if (
    (addressData as any).coordinates.lat !== undefined &&
    (addressData as any).coordinates.lng !== undefined
  ) {
    geoAddress.coordinates = {
      type: "Point",
      coordinates: [
        (addressData as any).coordinates.lng,
        (addressData as any).coordinates.lat,
      ],
    } as any;
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
    address: addressData,
  };

  if (!kost.address && kost.progressStep < 2) {
    updatePayload.progressStep = 2;
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
  if (!kost.facilities?.length && kost.progressStep < 3) {
    updatePayload.progressStep = 3;
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
  if (kost.progressStep === 3) {
    updatePayload.progressStep = 4;
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

  let roomType;

  if (kost.roomTypes.length > 0) {
    // ✅ Update existing roomType (ambil roomType pertama misalnya)
    const existingRoomTypeId = kost.roomTypes[0]; // asumsi 1 kost 1 roomType
    roomType = await roomTypeRepository.updateById(existingRoomTypeId, {
      ...payload,
    });

    // Hapus rooms lama lalu buat ulang kalau jumlah berubah
    await roomRepository.deleteMany({ roomType: existingRoomTypeId });

    const rooms: RoomInput[] = [];
    for (let i = 1; i <= payload.total_rooms; i++) {
      rooms.push({
        roomType: existingRoomTypeId,
        number: `Kamar ${i}`,
        floor: Math.ceil(i / 10),
        status:
          i <= payload.total_rooms_occupied
            ? RoomStatus.OCCUPIED
            : RoomStatus.AVAILABLE,
      });
    }
    await roomRepository.createMany(rooms);
  } else {
    // ✅ Create new roomType
    roomType = await roomTypeRepository.create({
      ...payload,
      status: RoomTypeStatus.DRAFT,
    });

    const rooms: RoomInput[] = [];
    for (let i = 1; i <= payload.total_rooms; i++) {
      rooms.push({
        roomType: roomType._id,
        number: `Kamar ${i}`,
        floor: Math.ceil(i / 10),
        status:
          i <= payload.total_rooms_occupied
            ? RoomStatus.OCCUPIED
            : RoomStatus.AVAILABLE,
      });
    }
    await roomRepository.createMany(rooms);

    await kostRepository.updateById(kost._id, {
      $push: { roomTypes: roomType._id },
    });
  }

  // ✅ Update progress step kalau masih di bawah 6
  if (kost.progressStep < 5) {
    await kostRepository.updateById(kost._id, {
      progressStep: 5,
    });
  }

  return {
    kostId: kost._id,
    roomTypeId: roomType?._id,
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

const listAllPending = async (req: any) => {
  // Simpan ke database
  const kosts = await kostRepository.findAll({
    status: KostStatus.PENDING,
  });

  return kosts;
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

const getRecommendations = async (tenantId: string) => {
  const pref = await preferenceRepository.findOne({ tenant: tenantId }, [
    {
      path: "kostFacilities",
    },
    {
      path: "roomFacilities",
    },
    {
      path: "rules",
    },
  ]);
  const roomTypes = (await roomTypeRepository.findAll(
    {
      status: "active",
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
        path: "kost",
        populate: [
          {
            path: "facilities",
          },
          {
            path: "photos",
          },
          {
            path: "rules",
          },
        ],
      },
    ]
  )) as any;

  if (!pref) throw new ResponseError(404, "Preferensi tidak ada");
  const normalize = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, "_");

  const userFacilities = [...pref.kostFacilities, ...pref.roomFacilities].map(
    (facility: any) => normalize(facility.name)
  );

  const userRules = (pref.rules || []).map((k: any) => k.name).join(" ");

  // Buat dokumen TF-IDF untuk semua kostType
  const facilityDocs: string[][] = roomTypes.map((kt: any) => {
    const kostFacilities = (kt.kost?.facilities || []).map(
      (facility: IFacility) => facility.name
    );
    const roomFacilities = (kt.facilities || []).map((f: IFacility) => f.name);
    const all = [...kostFacilities, ...roomFacilities].map(normalize);
    return Array.from(new Set(all)); // remove duplikat
  });
  const ruleDocs = roomTypes.map((roomType: any) =>
    (roomType.kost?.rules || []).map((rule: IRule) => rule.name).join(" ")
  );

  console.log(roomTypes[0].kost);

  const tfidfFacilities = getTfIdfVectors([userFacilities, ...facilityDocs]);

  const tfidfRules = getTfIdfVectors([userRules, ...ruleDocs]);

  const result = roomTypes.map((roomType: any, i: number) => {
    const kost = roomType.kost;
    const [lng, lat] = kost.address?.coordinates.coordinates || [];

    // Lokasi
    const jarak = getDistanceInMeters(
      pref.address.coordinates.lat,
      pref.address.coordinates.lng,
      lat,
      lng
    );
    const locationScore = getHaversineScore(jarak);

    // Harga
    const price = roomType.price || 0;

    const priceScore = getPriceScore(price, pref.price.min, pref.price.max);

    // Jenis Kost
    const kostTypeScore = kost.type === pref.kostType ? 1 : 0;

    const facilityScore = getCosineSimilarity(tfidfFacilities, i + 1);

    const ruleScore = getCosineSimilarity(tfidfRules, i + 1);

    console.log();

    // Final Score (berdasarkan bobot)
    const finalScore =
      locationScore * 0.35 +
      priceScore * 0.25 +
      facilityScore * 0.15 +
      ruleScore * 0.15 +
      kostTypeScore * 0.1;

    console.log(
      locationScore,
      priceScore,
      facilityScore,
      ruleScore,
      kostTypeScore
    );

    // Ambil fasilitas gabungan (nama)
    const kostFacilities = (kost.fasilitas || []).map((f: IFacility) => f.name);
    const roomFacilities = (roomType.fasilitas || []).map(
      (f: IFacility) => f.name
    );
    const allFacilities = Array.from(
      new Set([...kostFacilities, ...roomFacilities])
    );

    // Ambil foto (gabung foto kost dan foto kamar)
    const kostPhotos = kost.photos?.map((photo: IPhotoKost) => photo.url) || [];
    const roomPhotos =
      roomType.photos?.map((photo: IPhotoRoom) => photo.url) || [];
    const photos = [...kostPhotos, ...roomPhotos];

    return {
      id: roomType._id,
      skor: finalScore,
      nama_kost: `${kost.name} - ${roomType.name}`,
      alamat: `${kost.address?.district}, ${kost.address?.city}`,
      type: kost.type,
      price: price,
      fasilitas: allFacilities,
      photos,
    };
  });
  const res = result.sort((a: any, b: any) => b.skor - a.skor).slice(0, 10);

  return res;
};

export default {
  getAll,
  listOwner,
  createKost,
  updateKost,
  getRecommendations,
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
