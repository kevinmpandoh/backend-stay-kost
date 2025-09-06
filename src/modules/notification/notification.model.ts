import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId | string;
  role: "admin" | "owner" | "tenant";
  type: "chat" | "booking" | "payment" | "subscription" | "payout" | "system";
  title?: string;
  message: string;
  metadata?: Record<string, any>; // simpan ID booking/invoice, dll
  isRead: boolean;
  isReadAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "owner", "tenant"], required: true },
    type: {
      type: String,
      required: true,
      enum: ["chat", "booking", "payment", "subscription", "payout", "system"],
    },
    title: { type: String },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }, // fleksibel
    isRead: { type: Boolean, default: false },
    isReadAt: { type: Date },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
