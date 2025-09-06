import express from "express";

import { WishlistController } from "./wishlist.controller";
import { auth, role } from "@/middlewares/auth.middleware";

const router = express.Router();

router.use(auth, role(["tenant"]));

router.get("/", WishlistController.getWishlist);
router.get("/:roomTypeId", WishlistController.getWishlistDetail);
router.post("/:roomTypeId", WishlistController.addWishlist);
router.delete("/:roomTypeId", WishlistController.removeWishlist);

export default router;
