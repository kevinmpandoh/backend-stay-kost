import { Router } from "express";

import { auth, role } from "../../middlewares/auth.middleware";
import { PaymentController } from "./payment.controller";
const router = Router();

router.post("/callback", PaymentController.handleMidtransCallback);
router.get(
  "/tenant",
  auth,
  role(["tenant"]),
  PaymentController.getAllPaymentTenant
);
router.get(
  "/:paymentId/status",
  auth,
  role(["tenant", "owner"]),
  PaymentController.confirmPayment
);
// router.post("/subscription", PaymentController.createSubscription);
// router.post("/midtrans/callback", PaymentController.midtransCallback);
export default router;
