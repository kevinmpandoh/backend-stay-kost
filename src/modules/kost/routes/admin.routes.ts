import { Router } from "express";
import kostController from "../kost.controller";
import { validate } from "@/middlewares/validate.middleware";

import { auth, role } from "@/middlewares/auth.middleware";
import { rejectKostSchema } from "../kost.validation";

const router = Router();
router.use(auth, role(["admin", "owner"]));

router.get(
  "/",
  kostController.listAllPending // lihat semua kost pending
);
router.get(
  "/:kostId",
  kostController.getKostById // lihat semua kost pending
);
router.patch("/:kostId/approve", kostController.approve);
router.patch(
  "/:kostId/reject",
  validate(rejectKostSchema),
  kostController.reject
);

export default router;
