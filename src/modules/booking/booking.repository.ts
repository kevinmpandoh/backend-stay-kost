import { BaseRepository } from "../../core/base.repository";
import { Booking, IBooking } from "./booking.model";

import mongoose, { FilterQuery, Types } from "mongoose";

export class BookingRepository extends BaseRepository<IBooking> {
  constructor() {
    super(Booking);
  }

  async findBookingsWithFilters({
    page = 1,
    limit = 10,
    ownerId,
    status,
    kostId,
    search,
    sort,
  }: {
    page: number;
    limit: number;
    ownerId?: string;
    status?: string;
    kostId?: string;
    search?: string;
    sort?: string;
  }) {
    const pipeline: any[] = [];

    // 1. MATCH DASAR (kalau ada ownerId)
    const match: any = {};
    if (ownerId) {
      match.owner = new Types.ObjectId(ownerId);
    }
    const countPipeline: any[] = [{ $match: match }];

    if (status) {
      match.status = status;
    } else {
      match.status = { $ne: "active" }; // exclude active
    }

    if (kostId) {
      match.kost = new Types.ObjectId(kostId);
    }

    pipeline.push({ $match: match });

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "tenant",
          foreignField: "_id",
          as: "tenant",
        },
      },
      { $unwind: "$tenant" }
    );

    // 2. JOIN ROOMTYPE
    pipeline.push(
      {
        $lookup: {
          from: "roomtypes",
          localField: "roomType",
          foreignField: "_id",
          as: "roomType",
        },
      },
      { $unwind: "$roomType" }
    );
    pipeline.push(
      {
        $lookup: {
          from: "photorooms",
          localField: "roomType.photos",
          foreignField: "_id",
          as: "photoRooms",
        },
      }
      // { $unwind: "$roomType" }
    );

    // 3. JOIN KOST
    pipeline.push(
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } }
    );

    // 4. JOIN TENANT
    pipeline.push(
      {
        $lookup: {
          from: "kosts",
          localField: "kost",
          foreignField: "_id",
          as: "kost",
        },
      },
      { $unwind: "$kost" }
    );
    // 5. FILTER KOST ID
    let searchFilter: any = null;
    // 6. FILTER SEARCH
    if (search) {
      searchFilter = {
        $or: [
          { "tenant.name": { $regex: search, $options: "i" } },
          { "kost.name": { $regex: search, $options: "i" } },
          { "roomType.name": { $regex: search, $options: "i" } },
        ],
      };
    }

    if (searchFilter) {
      pipeline.push({ $match: searchFilter });
      countPipeline.push({ $match: searchFilter });
    }

    pipeline.push({
      $project: {
        _id: 1,
        status: 1,
        totalPrice: 1,
        duration: 1,
        startDate: 1,
        endDate: 1,
        confirmDueDate: 1,
        createdAt: 1,

        tenant: {
          _id: "$tenant._id",
          name: "$tenant.name",
          foto_profile: "$tenant.avatarUrl",
        },
        kost: {
          _id: "$kost._id",
          name: "$kost.name",
          type: "$kost.type",
        },
        roomType: {
          _id: "$roomType._id",
          name: "$roomType.name",
          price: "$roomType.price",
          photos: "$photoRooms",
        },
        room: {
          _id: "$room._id",
          number: "$room.number",
        },
      },
    });

    // 7. SORTING
    if (sort === "price_asc") {
      pipeline.push({ $sort: { totalPrice: 1 } });
    } else if (sort === "price_desc") {
      pipeline.push({ $sort: { totalPrice: -1 } });
    } else if (sort === "date_asc") {
      pipeline.push({ $sort: { createdAt: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // 8. PAGINATION
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    // 9. COUNT PIPELINE
    countPipeline.push({ $count: "total" });

    const [result, totalData] = await Promise.all([
      this.model.aggregate(pipeline),
      this.model.aggregate(countPipeline),
    ]);

    const total = totalData[0]?.total || 0;

    return {
      docs: result,
      totalDocs: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }
}

export const bookingRepository = new BookingRepository();
