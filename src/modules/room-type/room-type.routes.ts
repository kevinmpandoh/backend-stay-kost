import { Router } from "express";

import { validate } from "@/middlewares/validate.middleware";

import { auth, role } from "@/middlewares/auth.middleware";
import roomTypeController from "./room-type.controller";
import {
  createRoomTypeSchema,
  updatePriceSchema,
  updateRoomTypeFacilitiesSchema,
} from "./room-type.validation";
import { upload } from "@/middlewares/upload.middleware";
import { uploadPhotoRoomSchema } from "../photo-room/photo-room.validation";
import { PhotoRoomController } from "../photo-room/photo-room.controller";

const router = Router();

router.post(
  "/",
  auth,
  role(["owner"]),
  validate(createRoomTypeSchema),
  roomTypeController.create
);

router.get(
  "/:roomTypeId",
  auth,
  role(["owner"]),
  roomTypeController.getRoomTypeOwner
);
router.put(
  "/:roomTypeId",
  auth,
  role(["owner"]),
  roomTypeController.updateRoomType
);
router.delete(
  "/:roomTypeId",
  auth,
  role(["owner"]),
  roomTypeController.deleteRoomType
);

router.patch(
  "/:roomTypeId",
  auth,
  role(["owner"]),
  roomTypeController.updateRoomType
);

router.patch(
  "/:roomTypeId/facilities",
  auth,
  role(["owner"]),
  validate(updateRoomTypeFacilitiesSchema),
  roomTypeController.updateFacilities
);

router.get("/:roomTypeId/photo-room", PhotoRoomController.getPhotoByRoomType);
router.patch(
  "/:roomTypeId/photo-room",
  auth,
  role(["owner"]),
  roomTypeController.updatePhotoRoom
);

router.patch(
  "/:roomTypeId/price",
  auth,
  role(["owner"]),
  validate(updatePriceSchema),
  roomTypeController.updatePrice
);

router.delete("/:roomTypeId", roomTypeController.deleteRoomType);

export default router;
