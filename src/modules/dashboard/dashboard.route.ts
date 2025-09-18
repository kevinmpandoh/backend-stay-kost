import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";

import { DashboardController } from "./dashboard.controller";

const router = express.Router();

router.use(auth);

router.get("/owner", role(["owner"]), DashboardController.getOwnerDashboard);
router.get("/admin", role(["admin"]), DashboardController.getAdminDashboard);

export default router;
