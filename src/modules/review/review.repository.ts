import { BaseRepository } from "../../core/base.repository";
import { IReview, Review } from "./review.model";

export class ReviewRepository extends BaseRepository<IReview> {
  constructor() {
    super(Review);
  }

  async findReviewsWithFilters({
    page = 1,
    limit = 10,
    rating,
    search,
    sort = "-createdAt",
  }: {
    page?: number;
    limit?: number;
    rating?: string;
    search?: string;
    sort?: string;
  }) {
    const skip = (page - 1) * limit;
    const pipeline: any[] = [
      // Join tenant
      {
        $lookup: {
          from: "users",
          localField: "tenant",
          foreignField: "_id",
          as: "tenant",
        },
      },
      { $unwind: "$tenant" },

      // Join roomType
      {
        $lookup: {
          from: "roomtypes",
          localField: "roomType",
          foreignField: "_id",
          as: "roomType",
        },
      },
      { $unwind: "$roomType" },

      // Join booking + room
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $lookup: {
          from: "rooms",
          localField: "booking.room",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },
    ];

    // Filter by rating
    if (rating) {
      pipeline.push({
        $match: { rating: Number(rating) },
      });
    }

    // Search by tenant name, roomType name, or comment
    if (search) {
      const regex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { "tenant.name": regex },
            { "roomType.name": regex },
            { comment: regex },
          ],
        },
      });
    }

    // Count total dulu
    const countPipeline = [...pipeline, { $count: "total" }];
    const totalDocsResult = await Review.aggregate(countPipeline);
    const totalDocs = totalDocsResult[0]?.total || 0;

    // Sorting
    pipeline.push({
      $sort: sort.startsWith("-") ? { [sort.substring(1)]: -1 } : { [sort]: 1 },
    });

    // Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const docs = await Review.aggregate(pipeline);

    return {
      docs,
      totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      hasNextPage: page * limit < totalDocs,
      hasPrevPage: page > 1,
    };
  }
}

export const reviewRepository = new ReviewRepository();
