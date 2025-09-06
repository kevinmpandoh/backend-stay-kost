import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  rating: number;
  comment: string;
  reply?: {
    message: string;
    createdAt: Date;
  };
  booking: mongoose.Types.ObjectId | string;
  tenant: mongoose.Types.ObjectId | string;
  owner: mongoose.Types.ObjectId | string;
  roomType: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema<IReview>(
  {
    rating: { type: Number, required: true, enum: [1, 2, 3, 4, 5] },
    comment: { type: String, required: true },
    reply: {
      message: { type: String },
      createdAt: { type: Date },
    },
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    tenant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roomType: { type: Schema.Types.ObjectId, ref: "RoomType", required: true }, // Ganti ke KostType
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ tenant: 1 });
ReviewSchema.index({ roomType: 1 });
ReviewSchema.index({ owner: 1 }); // kalau ditambah field owner

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
