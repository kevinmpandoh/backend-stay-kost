import { Router } from "express";

import { auth, role } from "../../middlewares/auth.middleware";
import { PaymentController } from "./payment.controller";
import { validate } from "@/middlewares/validate.middleware";
import { createPaymentSchema } from "../invoice/invoice.type";
const router = Router();

router.post("/callback", PaymentController.handleMidtransCallback);
router.get(
  "/tenant",
  auth,
  role(["tenant"]),
  PaymentController.getAllPaymentTenant
);
router.patch(
  "/:paymentId/status",
  auth,
  role(["tenant", "owner"]),
  PaymentController.confirmPayment
);
router.put(
  "/:paymentId/change-method",
  auth,
  role(["owner", "tenant"]),
  validate(createPaymentSchema),
  PaymentController.changePaymentMethod
);
// router.post("/subscription", PaymentController.createSubscription);
// router.post("/midtrans/callback", PaymentController.midtransCallback);
export default router;
