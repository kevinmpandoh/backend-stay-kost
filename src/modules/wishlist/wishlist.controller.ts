import { WishlistService } from "./wishlist.service";
import { NextFunction, Request, Response } from "express";

export const WishlistController = {
  async addWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;
      const { roomTypeId } = req.params;
      const wishlist = await WishlistService.addWishlist(tenantId, roomTypeId);
      res
        .status(201)
        .json({ message: "Kost ditambahkan ke wishlist", wishlist });
    } catch (error) {
      next(error);
    }
  },

  async removeWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;
      const { roomTypeId } = req.params;
      await WishlistService.removeWishlist(tenantId, roomTypeId);
      res.json({ message: "Kost dihapus dari wishlist" });
    } catch (error) {
      next(error);
    }
  },

  async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;
      const wishlist = await WishlistService.getWishlist(tenantId);
      res.json({ status: "success", data: wishlist });
    } catch (error) {
      next(error);
    }
  },
  async getWishlistDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;
      const { roomTypeId } = req.params;
      const wishlist = await WishlistService.getWishlistByKostType(
        tenantId,
        roomTypeId
      );
      res.json(wishlist);
    } catch (error) {
      next(error);
    }
  },
};
