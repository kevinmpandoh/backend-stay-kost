import mongoose, { Schema, model, Document } from "mongoose";

export interface IOwner extends Document {
  user: mongoose.Types.ObjectId | string;
  bankAccount?: string;
  bankName?: string;
}

const ownerSchema = new Schema<IOwner>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bankAccount: String,
    bankName: String,
  },
  { timestamps: true }
);

export const Owner = model<IOwner>("Owner", ownerSchema);
