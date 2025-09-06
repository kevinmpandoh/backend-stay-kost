import { Router } from "express";

import { auth, role } from "@/middlewares/auth.middleware";
import userController from "./user.controller";

const router = Router();

router.use(auth, role(["admin"]));

// Tenant management
router.get("/tenants", userController.getAllTenants);
router.get("/tenants/:id", userController.getTenantById);

// Owner management
router.get("/owners", userController.getAllOwners);
router.get("/owners/:id", userController.getOwnerById);

export default router;
