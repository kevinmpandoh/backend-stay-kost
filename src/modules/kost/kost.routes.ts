import { Router } from "express";
import kostController from "./kost.controller";
import { validate } from "@/middlewares/validate.middleware";

import { auth, role } from "@/middlewares/auth.middleware";
import {
  createKostSchema,
  kostFilterSchema,
  rejectKostSchema,
  updateAddressKostSchema,
  updateFacilityKostSchema,
  updateKostSchema,
} from "./kost.validation";

const router = Router();

// Public
router.get("/", validate(kostFilterSchema, "query"), kostController.listPublic);
router.get("/:roomTypeId", kostController.getDetailKostPublic);

// Owner
router.get("/owner", auth, role(["owner"]), kostController.listOwnerKost);
router.get(
  "/owner/:kostId",
  auth,
  role(["owner"]),
  kostController.getDetailOwnerKost
);
router.post(
  "/",
  auth,
  role(["owner"]),
  validate(createKostSchema),
  kostController.createKost
);
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
router.get(
  "/:kostId/photo-kost",
  // upload.single("photo"),
  kostController.getAllPhotoKost
);
router.patch(
  "/:kostId/photo-kost",
  // upload.single("photo"),
  kostController.updatePhotoKost
);
router.post("/:kostId/room-type", kostController.updateRoomType);
router.delete("/:kostId", auth, kostController.deleteKost);

// Admin
router.get(
  "/",
  kostController.listAllPending // lihat semua kost pending
);
router.patch("/:kostId/approve", kostController.approve);
router.patch(
  "/:kostId/reject",
  validate(rejectKostSchema),
  kostController.reject
);

export default router;
