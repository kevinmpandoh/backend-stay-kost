import { BaseRepository } from "../../core/base.repository";

import { IWishlist, Wishlist } from "./wishlist.model";

export class WishlistRepository extends BaseRepository<IWishlist> {
  constructor() {
    super(Wishlist);
  }
}

export const wishlistRepository = new WishlistRepository();
