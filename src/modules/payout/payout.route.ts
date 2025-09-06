import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";
import { PayoutController } from "./payout.controller";

import { validate } from "@/middlewares/validate.middleware";
import { updateBeneficiariesSchema } from "./payout.validation";

const router = express.Router();

router.get("/", auth, role(["admin"]), PayoutController.getAllPayout);
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

router.post("/:payoutId/approve", PayoutController.approvePayout);
router.post("/:payoutId/reject", PayoutController.rejectPayout);
router.post("/:payoutId/send", PayoutController.sendPayout);

export default router;
