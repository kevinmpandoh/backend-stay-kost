import { Router } from "express";
import kostController from "../kost.controller";
import { validate } from "@/middlewares/validate.middleware";

import { auth, role } from "@/middlewares/auth.middleware";
import {
  createKostSchema,
  updateAddressKostSchema,
  updateFacilityKostSchema,
  updateKostSchema,
} from "../kost.validation";

const router = Router();

router.use(auth, role(["owner"]));

router.get("/", auth, kostController.listOwnerKost);
router.get("/:kostId", kostController.getDetailOwnerKost);
router.post("/", validate(createKostSchema), kostController.createKost);
router.get("/:kostId", kostController.getDetailOwnerKost);
router.patch("/:kostId", validate(updateKostSchema), kostController.updateKost);
router.patch(
  "/:kostId/address",
  validate(updateAddressKostSchema),
  kostController.updateAddress
);
router.patch(
  "/:kostId/facilities",
  validate(updateFacilityKostSchema),
  kostController.updateFacilities
);
router.patch(
  "/:kostId/photo-kost",
  // upload.single("photo"),
  kostController.updatePhotoKost
);
router.post("/:kostId/room-type", kostController.updateRoomType);
router.delete("/:kostId", auth, kostController.deleteKost);

export default router;
