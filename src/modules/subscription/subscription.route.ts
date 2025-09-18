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

// Subscription aktif sekarang
router.get(
  "/current",
  role(["owner"]),
  subscriptionController.getCurrentSubscription
);

// Semua subscription user
router.get("/me", role(["owner"]), subscriptionController.getMySubscription);

router.get(
  "/invoices",
  role(["owner"]),
  subscriptionController.getSubscriptionInvoices
);
router.post(
  "/invoices/:invoiceId/cancel",
  role(["owner"]),
  subscriptionController.cancelSubscriptionInvoice
);

// Renew subscription tertentu
router.post(
  "/:subscriptionId/renew",
  role(["owner"]),
  subscriptionController.renewSubscription
);

router.get("/", subscriptionController.getAll);

export default router;
