import { Types } from "mongoose";

export enum RoomStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  MAINTENANCE = "maintenance",
}

export interface IRoom extends Document {
  _id: Types.ObjectId;
  roomType: Types.ObjectId | string; // Ref ke RoomType
  floor: number;
  number: string; // contoh: "101", "A-1"
  status: RoomStatus;
}

export interface RoomInput {
  roomType: Types.ObjectId | string;
  number: string;
  status: RoomStatus;
  floor: number;
}
