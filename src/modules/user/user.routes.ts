import { Router } from "express";
import userController from "./user.controller";
import { auth, role } from "../../middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { bankAccountSchema, updateProfileSchema } from "./user.validation";

const router = Router();

router.use(auth);

router.get("/current", userController.getCurrent);
router.put(
  "/current",
  validate(updateProfileSchema),
  userController.updateProfile
);
router.put("/change-password", userController.changePassword);
router.post(
  "/upload",
  upload.single("photo_profile"),
  userController.uploadProfile
);
router.get("/banks", auth, role(["owner"]), userController.getAvailableBanks);
router.put(
  "/bank-account",
  auth,
  role(["owner"]),
  validate(bankAccountSchema),
  userController.addOrUpdateBankAccount
);

// Tenant management
// router.get("/admins", userController.getAllTenants);
// router.get("/admins/:id", userController.getTenantById);

// Admin management
router.get("/tenants", userController.getAllTenants);
router.get("/tenants/:id", userController.getTenantById);

// Owner management
router.get("/owners", userController.getAllOwners);
router.get("/owners/:id", userController.getOwnerById);

export default router;
