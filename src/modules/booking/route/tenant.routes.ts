import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";
import { bookingController } from "../booking.controller";
import { upload } from "@/middlewares/upload.middleware";
import { validate } from "@/middlewares/validate.middleware";
import {
  createBookingSchema,
  rejectBookingSchema,
  stopRentRequestSchema,
} from "../booking.validation";
import { ReviewController } from "@/modules/review/review.controller";
import { createReviewSchema } from "@/modules/review/review.validation";

const router = express.Router();

router.use(auth, role(["tenant"]));

router.get("/", bookingController.getBookingListTenant);
router.post(
  "/",
  validate(createBookingSchema),
  bookingController.createBooking
);
router.get("/active", role(["tenant"]), bookingController.getActiveBookings);
router.get("/history", bookingController.getBookingHistoryTenant);
router.post(
  "/upload",
  upload.single("photo"),
  bookingController.uploadDocument
);
router.post("/:bookingId/check-in", bookingController.checkIn);
router.post("/:bookingId/check-out", bookingController.checkOut);
router.post(
  "/:bookingId/stop-rent",
  validate(stopRentRequestSchema),
  bookingController.stopRentRequest
);

router.post(
  "/:bookingId/review",
  validate(createReviewSchema),
  ReviewController.createReview
);
router.post("/:bookingId/check-out", bookingController.checkOut);

export default router;
