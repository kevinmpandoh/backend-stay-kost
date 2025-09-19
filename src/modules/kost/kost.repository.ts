import { BaseRepository } from "../../core/base.repository";
import { RoomTypeStatus } from "../room-type/room-type.type";
import { Room } from "../room/room.model";
import { RoomStatus } from "../room/room.type";
import { IKost, Kost } from "./kost.model";
import mongoose, { FilterQuery, Types } from "mongoose";

const campusLocations: Record<
  string,
  { coordinates: [number, number]; radius: number }
> = {
  unima: {
    coordinates: [124.88317662259409, 1.266748889858694],
    radius: 3000,
  },
  unsrat: {
    coordinates: [124.82697719413021, 1.4555129675509293],
    radius: 3000,
  },
  polimdo: {
    coordinates: [124.88644426209673, 1.518557860682779],
    radius: 3000,
  },
  prisma: {
    coordinates: [124.85555118, 1.47442635],
    radius: 3000,
  },
  delasalle: {
    coordinates: [124.87284191712374, 1.504660271899869],
    radius: 3000,
  },
  ukit: {
    coordinates: [124.83654220258768, 1.3378605678648756],
    radius: 3000,
  },
  unklab: {
    coordinates: [124.98399411517693, 1.4174553150864977],
    radius: 3000,
  },
  stti: {
    coordinates: [124.85443492827346, 1.4574036018785466],
    radius: 3000,
  },
};

export class KostRepository extends BaseRepository<IKost> {
  constructor() {
    super(Kost);
  }

  async isNameTaken(
    name: string,
    ownerId: string,
    excludeId?: string
  ): Promise<boolean> {
    const filter: FilterQuery<IKost> = { name, owner: ownerId };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return !!(await this.model.exists(filter));
  }

  async findRoomTypesWithFilters(query: any) {
    const {
      page = 1,
      limit = 16,
      minPrice = 0,
      maxPrice,
      kostType,
      kostFacilities,
      roomFacilities,
      rules,
      sort,
      rating,
      search,
    } = query;

    const pipeline: any[] = [];

    const lowerSearch = search?.toLowerCase();
    const campusMatch = lowerSearch && campusLocations[lowerSearch];

    // 1. GEO FILTER
    if (campusMatch) {
      // $geoNear HARUS paling pertama di pipeline
      pipeline.unshift({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: campusMatch.coordinates,
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: campusMatch.radius,
          key: "address.coordinates", // ✅ sesuai index
        },
      });
    }

    // 2. JOIN TIPE KOST
    pipeline.push({
      $lookup: {
        from: "roomtypes",
        localField: "_id",
        foreignField: "kost",
        as: "roomTypes",
      },
      // $unwind: "$roomTypes",
    });

    // 3. FLATTEN TIPE KOST (kalau 1 kost bisa punya banyak tipe)
    pipeline.push({
      $unwind: "$roomTypes",
    });

    pipeline.push({
      $match: {
        isPublished: true,
        "roomTypes.status": RoomTypeStatus.ACTIVE,
      },
    });

    // 5. FILTER price
    if (minPrice !== undefined && maxPrice) {
      pipeline.push({
        $match: {
          "roomTypes.price": {
            $gte: minPrice,
            $lte: maxPrice,
          },
        },
      });
    }

    // 6. FILTER TIPE
    if (kostType && kostType.length > 0) {
      pipeline.push({
        $match: {
          type: { $in: kostType },
        },
      });
    }

    // 7. JOIN FASILITAS KOST
    pipeline.push({
      $lookup: {
        from: "facilities",
        localField: "facilities",
        foreignField: "_id",
        as: "facilities",
      },
    });

    // 15. JOIN FOTO KOST DAN KAMAR (opsional)
    pipeline.push(
      {
        $lookup: {
          from: "photokosts",
          localField: "photos",
          foreignField: "_id",
          as: "photos",
        },
      },
      {
        $lookup: {
          from: "photorooms",
          localField: "roomTypes.photos",
          foreignField: "_id",
          as: "roomTypes.photos",
        },
      }
    );

    // 8. FILTER FASILITAS KOST
    if (kostFacilities && kostFacilities.length > 0) {
      pipeline.push({
        $match: {
          "facilities.name": { $all: kostFacilities },
        },
      });
    }

    // 9. JOIN FASILITAS KAMAR
    pipeline.push({
      $lookup: {
        from: "facilities",
        localField: "roomTypes.facilities",
        foreignField: "_id",
        as: "roomTypes.facilities",
      },
    });

    pipeline.push({
      $lookup: {
        from: "rooms",
        localField: "roomTypes.rooms",
        foreignField: "_id",
        as: "roomTypes.rooms",
      },
    });

    // 10. FILTER FASILITAS KAMAR
    if (roomFacilities && roomFacilities.length > 0) {
      pipeline.push({
        $match: {
          "roomTypes.facilities.name": { $all: roomFacilities },
        },
      });
    }

    // 11. JOIN PERATURAN
    if (rules && rules.length > 0) {
      pipeline.push({
        $lookup: {
          from: "rules",
          localField: "rules",
          foreignField: "_id",
          as: "rules",
        },
      });
      pipeline.push({
        $match: {
          "rules.name": { $all: rules },
        },
      });
    }

    // 13. FILTER SEARCH
    if (search && !campusMatch) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { "roomTypes.name": { $regex: search, $options: "i" } },
            { "address.district": { $regex: search, $options: "i" } },
            { "address.city": { $regex: search, $options: "i" } },
            { "address.province": { $regex: search, $options: "i" } },
            { "address.detail": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // 14. FILTER RATING
    if (rating) {
      pipeline.push({
        $match: {
          rating: { $gte: parseFloat(rating) },
        },
      });
    }

    // 16. SORTING
    if (sort === "price_asc") {
      pipeline.push({ $sort: { "roomTypes.price": 1 } });
    } else if (sort === "price_desc") {
      pipeline.push({ $sort: { "roomTypes.price": -1 } });
    } else if (sort === "rating_high") {
      pipeline.push({ $sort: { rating: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // 17. PAGINATION MANUAL
    pipeline.push(
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );

    // 18. TOTAL COUNT SEBELUM SKIP/LIMIT
    const countPipeline = [
      ...pipeline.filter((p) => !("$skip" in p) && !("$limit" in p)),
      {
        $count: "total",
      },
    ];

    const [result, totalData] = await Promise.all([
      this.model.aggregate(pipeline),
      this.model.aggregate(countPipeline),
    ]);

    const total = totalData[0]?.total || 0;

    return {
      docs: result,
      totalDocs: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: parseInt(page) * parseInt(limit) < total,
      hasPrevPage: parseInt(page) > 1,
    };
  }
  async getNearbyKost(kostId: string, coordinates: [number, number]) {
    return await Kost.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: coordinates, // [lng, lat]
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: 2000, // 2 km dalam meter
          query: { _id: { $ne: new Types.ObjectId(kostId) } },
          key: "address.coordinates", // field yang di-index 2dsphere
        },
      },
      // Join ke kost_types
      {
        $lookup: {
          from: "roomtypes",
          localField: "_id",
          foreignField: "kost",
          as: "roomTypes",
        },
      },
      {
        $unwind: "$roomTypes",
      },

      // Join fasilitas kamar
      {
        $lookup: {
          from: "facilities",
          localField: "roomTypes.facilities",
          foreignField: "_id",
          as: "roomTypes.facilities",
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "roomTypes.rooms",
          foreignField: "_id",
          as: "rooms",
        },
      },

      // Join foto kost dan kamar (opsional)
      {
        $lookup: {
          from: "photorooms",
          localField: "roomTypes.photos",
          foreignField: "_id",
          as: "roomTypes.photos",
        },
      },
      {
        $lookup: {
          from: "photokosts",
          localField: "photos",
          foreignField: "_id",
          as: "photos",
        },
      },
      // Limit hasil
      { $limit: 4 },
      // Projection akhir
      {
        $project: {
          id: "$roomTypes._id",
          name: {
            $concat: ["$name", " ", "$roomTypes.name"],
          },
          type: 1,
          price: "$roomTypes.price",
          facilities: "$roomTypes.facilities.name",
          photos: {
            $cond: {
              if: { $gt: [{ $size: "$roomTypes.photos" }, 0] },
              then: "$roomTypes.photos.url",
              else: "$photos.url",
            },
          },
          rooms: "$rooms",
          rating: 1,
          address: {
            $concat: ["$address.district", ", ", "$address.city"],
          },
        },
      },
    ]);
  }
}

export const kostRepository = new KostRepository();
