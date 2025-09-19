import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";
import { PayoutController } from "./payout.controller";

import { validate } from "@/middlewares/validate.middleware";
import {
  queryFilterPayoutSchema,
  updateBeneficiariesSchema,
} from "./payout.validation";

const router = express.Router();

router.get(
  "/",
  auth,
  role(["admin"]),
  validate(queryFilterPayoutSchema, "query"),
  PayoutController.getAllPayout
);
router.post("/callback", PayoutController.handleMidtransCallback);
router.get(
  "/beneficiaries",
  auth,
  role(["admin"]),
  PayoutController.getAllBeneficiaries
);
router.put(
  "/beneficiaries/:aliasName",
  auth,
  role(["admin"]),
  validate(updateBeneficiariesSchema),
  PayoutController.updateBeneficiaries
);

router.post(
  "/:payoutId/approve",
  role(["admin"]),
  PayoutController.approvePayout
);
router.post(
  "/:payoutId/reject",
  role(["admin"]),
  PayoutController.rejectPayout
);
router.post(
  "/:payoutId/send",
  auth,
  role(["admin"]),
  PayoutController.sendPayout
);

export default router;
