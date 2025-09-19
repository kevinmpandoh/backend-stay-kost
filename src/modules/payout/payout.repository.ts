import { BaseRepository } from "../../core/base.repository";
import { Payout, IPayout } from "./payout.model";
import { Types } from "mongoose";

export class PayoutRepository extends BaseRepository<IPayout> {
  constructor() {
    super(Payout);
  }

  async findPayoutsWithFilters({
    page = 1,
    limit = 10,
    status,
    search,
    sort,
  }: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    sort?: string;
  }) {
    const pipeline: any[] = [];

    const match: any = {};
    if (status) {
      match.status = status;
    }

    // MATCH DASAR
    pipeline.push({ $match: match });

    // JOIN OWNER
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    });
    pipeline.push({ $unwind: "$owner" });

    // SEARCH
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { payoutNumber: { $regex: search, $options: "i" } },
            { "owner.name": { $regex: search, $options: "i" } },
            { "owner.email": { $regex: search, $options: "i" } },
            { accountName: { $regex: search, $options: "i" } },
            { channel: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // PROJECT
    pipeline.push({
      $project: {
        _id: 1,
        payoutNumber: 1,
        status: 1,
        amount: 1,
        platformFee: 1,
        netAmount: 1,
        currency: 1,
        provider: 1,
        method: 1,
        channel: 1,
        accountNumber: 1,
        accountName: 1,
        requestedAt: 1,
        transferredAt: 1,
        createdAt: 1,
        owner: {
          _id: "$owner._id",
          name: "$owner.name",
          email: "$owner.email",
          avatarUrl: "$owner.avatarUrl",
          phone: "$owner.phone",
        },
      },
    });

    // SORTING
    if (sort === "amount_asc") {
      pipeline.push({ $sort: { amount: 1 } });
    } else if (sort === "amount_desc") {
      pipeline.push({ $sort: { amount: -1 } });
    } else if (sort === "date_asc") {
      pipeline.push({ $sort: { createdAt: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } }); // default terbaru
    }

    // PAGINATION
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    // HITUNG TOTAL
    const countPipeline = [{ $match: match }, { $count: "total" }];

    const [result, totalData] = await Promise.all([
      this.model.aggregate(pipeline),
      this.model.aggregate(countPipeline),
    ]);

    const total = totalData[0]?.total || 0;

    return {
      docs: result,
      totalDocs: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }
}

export const payoutRepository = new PayoutRepository();
