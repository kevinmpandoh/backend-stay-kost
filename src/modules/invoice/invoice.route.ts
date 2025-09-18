import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";

import { invoiceController } from "./invoice.controller";
import { validate } from "@/middlewares/validate.middleware";
import { createPaymentSchema } from "./invoice.type";

const router = express.Router();
router.use(auth);

router.get("/owner", role(["owner"]), invoiceController.getOwnerInvoices);
router.get("/admin", role(["admin"]), invoiceController.getAdminInvoices);
router.get("/:invoiceNumber", invoiceController.getInvoice);
router.post(
  "/:invoiceNumber/payment",
  validate(createPaymentSchema),
  invoiceController.createPayment
);

export default router;
