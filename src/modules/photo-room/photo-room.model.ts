import mongoose, { Schema, Document } from "mongoose";

export enum PhotoRoomCategory {
  INSIDE_ROOM = "dalam_kamar",
  FRONT_ROOM = "depan_kamar",
  BATH_ROOM = "kamar_mandi",
}

export interface IPhotoRoom extends Document {
  roomType: mongoose.Types.ObjectId | string;
  owner: Schema.Types.ObjectId | string;
  category: string;
  url: string;
  publicId: string;
}

const PhotoRoomSchema: Schema = new Schema<IPhotoRoom>({
  roomType: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: String,
    enum: Object.values(PhotoRoomCategory),
    required: true,
  },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
});

export const PhotoRoom = mongoose.model<IPhotoRoom>(
  "PhotoRoom",
  PhotoRoomSchema
);
