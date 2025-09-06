import { Types } from "mongoose";

export enum RoomTypeStatus {
  ACTIVE = "active",
  DRAFT = "draft",
}

export interface createRoomTypePayload {
  name: string;
  size: string;
  total_rooms: number;
  total_rooms_occupied: number;
  kost: string; // ID kost yang terkait
}
