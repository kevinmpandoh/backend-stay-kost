import { Router } from "express";
import publicRoutes from "./public.routes";
import ownerRoutes from "./owner.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/kost", publicRoutes);
router.use("/owner/kost", ownerRoutes);
router.use("/admin/kost", adminRoutes);

export default router;
