import { Schema, Types, model, Document } from "mongoose";
export interface ISubscription extends Document {
  _id: Types.ObjectId | string;
  owner: Types.ObjectId | string;
  package: Types.ObjectId | string;
  status: "pending" | "active" | "expired" | "canceled";
  startDate?: Date;
  duration: number; // in days
  endDate?: Date | null;
}
const SubscriptionSchema = new Schema<ISubscription>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    package: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    duration: { type: Number, required: true }, // in months
    status: {
      type: String,
      enum: ["pending", "active", "expired", "canceled"],
      default: "pending",
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);
export const Subscription = model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);
