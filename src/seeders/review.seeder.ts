import { Booking } from "@/modules/booking/booking.model";
import { BookingStatus } from "@/modules/booking/booking.types";
import { Review } from "@/modules/review/review.model";
import {
  balasanNegatif,
  balasanUmum,
  komentarNegatif,
  komentarNetral,
  komentarPositif,
} from "./data/reviewData";
import { RoomType } from "@/modules/room-type/room-type.model";

export const seedReviews = async () => {
  await Review.deleteMany();

  const selesaiBookings = (await Booking.find({
    status: BookingStatus.COMPLETED,
    reviewed: true,
  })
    .populate("tenant")
    .populate("owner")
    .populate("roomType")) as any;

  if (selesaiBookings.length === 0) {
    console.error("❌ Tidak ada booking dengan status 'Selesai' dan reviewed.");
    return;
  }

  for (const booking of selesaiBookings) {
    const rand = Math.random();
    let rating: number;
    let comment: string;

    const isNegatif = rand < 0.15;
    const isNetral = rand >= 0.15 && rand < 0.4;

    if (isNegatif) {
      rating = Math.floor(Math.random() * 2) + 1; // 1–2
      comment =
        komentarNegatif[Math.floor(Math.random() * komentarNegatif.length)];
    } else if (isNetral) {
      rating = 3;
      comment =
        komentarNetral[Math.floor(Math.random() * komentarNetral.length)];
    } else {
      rating = Math.floor(Math.random() * 2) + 4; // 4–5
      comment =
        komentarPositif[Math.floor(Math.random() * komentarPositif.length)];
    }

    const withReply = Math.random() < 0.6;
    const isNegativeRating = rating <= 2;

    const review = await Review.create({
      rating,
      comment,
      roomType: booking.roomType._id,
      owner: booking.owner,
      tenant: booking.tenant,
      booking: booking._id,
      ...(withReply && {
        reply: {
          message: isNegativeRating
            ? balasanNegatif[Math.floor(Math.random() * balasanNegatif.length)]
            : balasanUmum[Math.floor(Math.random() * balasanUmum.length)],
          createdAt: new Date(),
        },
      }),
    });

    await RoomType.findByIdAndUpdate(review._id, {
      $push: {
        reviews: review._id,
      },
    });
  }

  console.log("✅ Seeder review dengan balasan pemilik berhasil dibuat!");
};
