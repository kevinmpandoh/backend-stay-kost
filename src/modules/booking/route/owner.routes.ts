import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";
import { bookingController } from "../booking.controller";
import { validate } from "@/middlewares/validate.middleware";
import { rejectBookingSchema } from "../booking.validation";

const router = express.Router();

router.use(auth, role(["owner", "tenant"]));

router.get("/", bookingController.getAllBookingOwner);
router.get("/active", bookingController.getAllActiveBookingOwner);
router.get("/:bookingId", bookingController.getDetailBooking);
router.patch("/:bookingId/approve", bookingController.approve);
router.patch(
  "/:bookingId/reject",
  validate(rejectBookingSchema),
  bookingController.reject
);
router.patch("/:bookingId/accept-stop-rent", bookingController.acceptStopRent);
router.patch(
  "/:bookingId/reject-stop-rent",
  validate(rejectBookingSchema),
  bookingController.rejectStopRent
);
router.post("/:bookingId/stop-rent-tenant", bookingController.stopRent);

export default router;
