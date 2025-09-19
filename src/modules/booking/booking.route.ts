import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";
import { bookingController } from "./booking.controller";
import { upload } from "@/middlewares/upload.middleware";
import { validate } from "@/middlewares/validate.middleware";
import {
  createBookingSchema,
  queryFilterSchema,
  rejectBookingSchema,
  stopRentRequestSchema,
  updateBookingSchema,
} from "./booking.validation";
import { ReviewController } from "../review/review.controller";
import { createReviewSchema } from "../review/review.validation";

const router = express.Router();

router.use(auth);

// Tenant
router.get("/tenant", bookingController.getBookingListTenant);
router.get(
  "/tenant/active",
  role(["tenant"]),
  bookingController.getActiveBookings
);
router.get(
  "/tenant/history",
  role(["tenant"]),
  bookingController.getBookingHistoryTenant
);
router.get(
  "/admin",
  validate(queryFilterSchema, "query"),
  bookingController.getAllBookingAdmin
);
router.get(
  "/owner",
  role(["owner"]),
  validate(queryFilterSchema, "query"),
  bookingController.getAllBookingOwner
);
router.get(
  "/owner/active",
  role(["owner"]),
  bookingController.getAllActiveBookingOwner
);

router.post(
  "/upload",
  upload.single("photo"),
  bookingController.uploadDocument
);
router.post(
  "/",
  role(["tenant"]),
  validate(createBookingSchema),
  bookingController.createBooking
);
router.post(
  "/:bookingId/check-in",
  role(["tenant"]),
  bookingController.checkIn
);
router.post(
  "/:bookingId/check-out",
  role(["tenant"]),
  bookingController.checkOut
);
router.post(
  "/:bookingId/stop-rent",
  role(["tenant"]),
  validate(stopRentRequestSchema),
  bookingController.stopRentRequest
);

router.post(
  "/:bookingId/review",
  role(["tenant"]),
  validate(createReviewSchema),
  ReviewController.createReview
);
router.post(
  "/:bookingId/check-out",
  role(["tenant"]),
  bookingController.checkOut
);

router.patch(
  "/:bookingId/cancle",
  role(["tenant"]),
  bookingController.cancelBooking
);

// OWNER
router.patch("/:bookingId/approve", role(["owner"]), bookingController.approve);
router.patch(
  "/:bookingId/reject",
  role(["owner"]),
  validate(rejectBookingSchema),
  bookingController.reject
);
router.patch(
  "/:bookingId/accept-stop-rent",
  role(["owner"]),
  bookingController.acceptStopRent
);
router.patch(
  "/:bookingId/reject-stop-rent",
  role(["owner"]),
  validate(rejectBookingSchema),
  bookingController.rejectStopRent
);
router.post(
  "/:bookingId/stop-rent-tenant",
  role(["owner"]),
  bookingController.stopRent
);

// admin

router.get(
  "/:bookingId",
  role(["owner", "admin", "tenant"]),
  bookingController.getDetailBooking
);

router.patch(
  "/:bookingId",
  role(["admin"]),
  validate(updateBookingSchema),
  bookingController.updateBooking
);

export default router;
