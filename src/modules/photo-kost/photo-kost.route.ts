import { Router } from "express";

import { validate } from "@/middlewares/validate.middleware";

import { auth, role } from "@/middlewares/auth.middleware";
import { PhotoKostController } from "./photo-kost.controller";
import { upload } from "@/middlewares/upload.middleware";
import { uploadPhotoKostSchema } from "./photo-kost.validation";

const router = Router();

router.post(
  "/upload",
  auth,
  role(["owner"]),
  upload.single("photo"),
  validate(uploadPhotoKostSchema),
  PhotoKostController.upload
);
router.delete("/:photoId", PhotoKostController.delete);
router.put("/:photoId", upload.single("photo"), PhotoKostController.replace);

export default router;
