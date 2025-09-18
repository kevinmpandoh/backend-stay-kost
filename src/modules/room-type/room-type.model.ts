import { Schema, Types, model } from "mongoose";
import { RoomTypeStatus } from "./room-type.type";

export interface IRoomType extends Document {
  _id: Types.ObjectId;
  kost: Types.ObjectId | string; // Ref ke Kost
  name: string; // contoh: Kamar Standar, Kamar VIP
  size: string; // ukuran kamar, misal: "3x4 meter"
  price: number; // harga per bulan
  progressStep: number;
  status: "draft" | "booked" | "maintenance"; // status kamar
  facilities: Types.ObjectId[]; // fasilitas khusus untuk tipe kamar ini
  photos: Types.ObjectId[]; // foto khusus tipe kamar
  rooms?: Types.ObjectId[]; // foto khusus tipe kamar
  reviews?: Types.ObjectId[];
}

const roomTypeSchema = new Schema<IRoomType>(
  {
    kost: { type: Schema.Types.ObjectId, ref: "Kost" },
    name: { type: String, required: true },
    price: { type: Number },
    size: { type: String, required: true }, // ukuran kamar, misal: "3x4 meter"
    status: {
      type: String,
      enum: Object.values(RoomTypeStatus),
      default: RoomTypeStatus.DRAFT,
    },
    progressStep: {
      type: Number,
      default: 1,
    },
    facilities: [{ type: Schema.Types.ObjectId, ref: "Facility" }],
    photos: [{ type: Schema.Types.ObjectId, ref: "PhotoRoom" }],
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    rooms: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  },
  { timestamps: true }
);

export const RoomType = model<IRoomType>("RoomType", roomTypeSchema);
