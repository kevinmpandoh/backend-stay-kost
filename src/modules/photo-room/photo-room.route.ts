import { Router } from "express";

import { validate } from "@/middlewares/validate.middleware";

import { auth, role } from "@/middlewares/auth.middleware";
import { PhotoRoomController } from "./photo-room.controller";
import { upload } from "@/middlewares/upload.middleware";
import { uploadPhotoRoomSchema } from "./photo-room.validation";

const router = Router();

router.post(
  "/upload",
  auth,
  role(["owner"]),
  upload.single("photo"),
  validate(uploadPhotoRoomSchema),
  PhotoRoomController.upload
);
router.delete("/:photoId", PhotoRoomController.delete);
router.put("/:photoId", upload.single("photo"), PhotoRoomController.replace);

export default router;
