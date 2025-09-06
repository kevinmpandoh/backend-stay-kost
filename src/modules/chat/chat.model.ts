import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  tenant: mongoose.Types.ObjectId | string;
  owner: mongoose.Types.ObjectId;
  kost: mongoose.Types.ObjectId | string;
  roomType: mongoose.Types.ObjectId | string;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kost: { type: Schema.Types.ObjectId, ref: "Kost", required: true },
    roomType: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
