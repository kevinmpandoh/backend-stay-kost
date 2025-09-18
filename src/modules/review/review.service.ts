import { bookingRepository } from "../booking/booking.repository";
import { reviewRepository, ReviewRepository } from "./review.repository";

import { kostRepository } from "../kost/kost.repository";

import { roomTypeRepository } from "../room-type/room-type.repository";
import { ResponseError } from "@/utils/response-error.utils";
import { BookingStatus } from "../booking/booking.types";
import { Review } from "./review.model";

export const ReviewService = {
  async createReview(
    bookingId: string,
    tenantId: string,
    payload: {
      rating: number;
      comment: string;
    }
  ) {
    // Cek apakah booking valid untuk ulasan
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new ResponseError(404, "Booking tidak ditemukan.");
    if (booking.tenant.toString() !== tenantId)
      throw new ResponseError(403, "Tidak diizinkan.");

    // Booking harus aktif atau sudah selesai tanpa ulasan sebelumnya
    if (
      ![
        BookingStatus.ACTIVE,
        BookingStatus.COMPLETED,
        BookingStatus.WAITING_FOR_CHECKOUT,
      ].includes(booking.status)
    )
      throw new ResponseError(
        403,
        "Ulasan hanya bisa diberikan saat sewa aktif atau selesai."
      );
    if (booking.reviewed)
      throw new ResponseError(403, "Ulasan sudah diberikan untuk booking ini.");

    // Simpan ulasan
    const review = await reviewRepository.create({
      tenant: tenantId,
      owner: booking.owner,
      roomType: booking.roomType,
      booking: bookingId,
      rating: payload.rating,
      comment: payload.comment,
    });

    // Tandai booking sebagai sudah diberi ulasan
    await bookingRepository.updateById(bookingId, { reviewed: true });
    await roomTypeRepository.updateById(booking.roomType, {
      $push: {
        reviews: review._id,
      },
    });
  },
  async replyReview(reviewId: string, payload: any) {
    const review = await reviewRepository.findById(reviewId);

    if (!review) throw new ResponseError(404, "Review tidak ditemukan.");

    if (review.reply && review.reply.message)
      throw new ResponseError(403, "Balasan sudah diberikan untuk Review ini.");

    // Simpan ulasan
    await reviewRepository.updateById(reviewId, {
      reply: {
        message: payload.message,
        createdAt: new Date(),
      },
    });
  },
  async getKostReviewsOwner(ownerId: string, pagination: any) {
    const { page = 1, limit = 10, search = "", rating } = pagination;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // const pageNumber = parseInt(page);
    // const pageSize = parseInt(limit);

    // Ambil semua kost_type milik pemilik ini
    // const kosts = await roomTypeRepository.findAll({ owner: ownerId });
    // const kostTypeIds = kosts.flatMap((kost: any) => kost.roomType);

    // Buat query filter
    const query: any = { owner: ownerId };
    if (search) {
      query["$or"] = [
        {
          comment: { $regex: search, $options: "i" },
        },
      ];
    }

    if (rating && rating !== "all") {
      query.rating = parseInt(rating as string);
    }

    // Hitung total
    const total = await reviewRepository.count(query);

    const reviews = await reviewRepository.findAll(
      query,
      { skip, limit: limitNum },
      [
        {
          path: "tenant",
          select: "name",
        },
        {
          path: "roomType",
          select: "name",
        },
        {
          path: "booking",
          select: "_id",
          populate: {
            path: "room",
            select: "number floor",
          },
        },
      ]
    );

    const totalPages = Math.ceil(total / limitNum);

    const formatted = reviews.map((review: any) => {
      return {
        id: review._id,
        reply: review.reply,
        rating: review.rating,
        comment: review.comment,
        tenantName: review.tenant.name,
        roomType: review.roomType.name,
        room: review.booking.room.number,
        createdAt: review.createdAt,
      };
    });

    return {
      data: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  },

  async getAllReviews(req: any) {
    const { page = 1, limit = 10, search = "", rating } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // const pageNumber = parseInt(page);
    // const pageSize = parseInt(limit);

    // Ambil semua kost_type milik pemilik ini
    const kosts = await kostRepository.findAll();
    const roomTypeIds = kosts.flatMap((kost: any) => kost.roomTypes);

    // Buat query filter
    const query: any = { roomType: { $in: roomTypeIds } };
    if (search) {
      query["$or"] = [
        {
          comment: { $regex: search, $options: "i" },
        },
      ];
    }

    if (rating) {
      query.rating = parseInt(rating as string);
    }

    // Hitung total
    const total = await Review.countDocuments(query);

    // Ambil data review dengan populate dan pagination
    const reviews = await Review.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .populate("tenant", "name")
      .populate("roomType", "name")
      .populate({
        path: "booking",
        select: "_id",
        populate: {
          path: "room",
          select: "number floor",
        },
      });

    const totalPages = Math.ceil(total / limitNum);

    const formatted = reviews.map((review: any) => {
      return {
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        reply: review.reply,
        tenantName: review.tenant.name,
        roomType: review.roomType.name,
        room: review.booking.room.number,
        createdAt: review.createdAt,
      };
    });

    return {
      data: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  },

  async deleteReview(reviewId: string) {
    return await reviewRepository.deleteById(reviewId);
  },
};
