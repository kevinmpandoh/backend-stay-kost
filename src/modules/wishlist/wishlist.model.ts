import mongoose, { Schema, Document } from "mongoose";

export interface IWishlist extends Document {
  _id: mongoose.Types.ObjectId | string;
  kost: mongoose.Types.ObjectId | string;
  roomType: mongoose.Types.ObjectId | string;
  tenant: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

const WishlistSchema: Schema = new Schema<IWishlist>(
  {
    kost: { type: Schema.Types.ObjectId, ref: "Kost", required: true },
    roomType: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
    tenant: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);
