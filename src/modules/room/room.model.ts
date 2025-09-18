import { Schema, model } from "mongoose";
import { IRoom, RoomStatus } from "./room.type";

const roomSchema = new Schema<IRoom>(
  {
    roomType: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
    number: { type: String, required: true },
    floor: { type: Number },
    status: {
      type: String,
      enum: Object.values(RoomStatus),
      default: RoomStatus.AVAILABLE,
    },
  },
  { timestamps: true }
);

export const Room = model<IRoom>("Room", roomSchema);
