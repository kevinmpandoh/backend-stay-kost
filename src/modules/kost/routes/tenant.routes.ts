import { Router } from "express";
import kostController from "../kost.controller";
import { auth, role } from "@/middlewares/auth.middleware";

const router = Router();

router.use(auth, role(["tenant"]));
router.get("/recomendations", kostController.getRecommendedKost);

export default router;
