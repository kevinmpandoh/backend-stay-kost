import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";
import { FacilityController } from "./facility.controller";

import {
  createFacilitySchema,
  updateFacilitySchema,
} from "./facility.validation";
import { validate } from "@/middlewares/validate.middleware";

const router = express.Router();

// router.use(auth);

router.get("/", FacilityController.getFacility);
router.post(
  "/",
  validate(createFacilitySchema),
  FacilityController.createFacility
);
router.put(
  "/:facilityId",
  validate(updateFacilitySchema),
  FacilityController.updateFacility
);
router.delete("/:facilityId", FacilityController.deleteFacility);

export default router;
