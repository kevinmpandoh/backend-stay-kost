import express from "express";

import { auth, role } from "@/middlewares/auth.middleware";
import { PreferenceController } from "./preference.controller";
import { validate } from "@/middlewares/validate.middleware";
import { preferenceSchema } from "./preference.validation";

const router = express.Router();
router.use(auth, role(["tenant"]));

router.get("/", PreferenceController.getPreference);
router.post(
  "/",
  validate(preferenceSchema),
  PreferenceController.setPreference
);

export default router;
