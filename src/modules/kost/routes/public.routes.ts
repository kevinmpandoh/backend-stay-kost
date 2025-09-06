import { Router } from "express";
import kostController from "../kost.controller";
import { validate } from "@/middlewares/validate.middleware";
import { kostFilterSchema } from "../kost.validation";

const router = Router();

router.get("/", validate(kostFilterSchema, "query"), kostController.listPublic);
router.get("/:roomTypeId", kostController.getDetailKostPublic);

export default router;
