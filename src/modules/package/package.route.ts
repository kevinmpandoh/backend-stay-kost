import { Router } from "express";
import PackageController from "./package.controller";
import { auth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createPackageSchema, updatePackageSchema } from "./package.validation";

const router = Router();
router.use(auth);

// 🔓 Public / Owner
router.get("/", PackageController.getAll); // semua paket aktif
router.get("/available", PackageController.getAvailablePackages); // semua paket aktif
router.get("/:id", PackageController.getPackageById); // detail paket

// 🔒 Admin only
router.post(
  "/",
  validate(createPackageSchema),
  PackageController.createPackage
);
router.put(
  "/:id",
  validate(updatePackageSchema),
  PackageController.updatePackage
);
router.delete("/:id", PackageController.deletePackage);

export default router;
