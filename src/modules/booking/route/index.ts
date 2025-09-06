import { Router } from "express";
import tenantRoutes from "./tenant.routes";
import ownerRoutes from "./owner.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/tenant/bookings", tenantRoutes);
router.use("/owner/bookings", ownerRoutes);
router.use("/admin/bookings", adminRoutes);

export default router;
