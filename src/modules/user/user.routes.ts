import { Router } from "express";
import userController from "./user.controller";
import { auth, role } from "../../middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { bankAccountSchema } from "./user.validation";

const router = Router();

router.use(auth);

router.get("/current", userController.getCurrent);
router.patch("/current", userController.updateProfile);
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
// router.get("/banks", PayoutController.getAllBank);

export default router;
