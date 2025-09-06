import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";
import { bookingController } from "../booking.controller";

const router = express.Router();

router.use(auth, role(["admin"]));

router.get("/", bookingController.getActiveBookings);

export default router;
