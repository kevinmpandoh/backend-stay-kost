import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import { validate } from "@/middlewares/validate.middleware";
import { createSubscriptionSchema } from "./subscription.validations";
import { auth, role } from "@/middlewares/auth.middleware";

const router = Router();
router.use(auth);

// Owner pilih paket → create invoice
router.post(
  "/",
  role(["owner"]),
  validate(createSubscriptionSchema),
  subscriptionController.createSubscription
);

// Get subscription aktif milik owner
router.get("/me", subscriptionController.getMySubscription);

// Admin/Owner lihat semua subscription
router.get("/", subscriptionController.getAll);

export default router;
