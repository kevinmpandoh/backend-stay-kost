import mongoose, { Schema, Document } from "mongoose";

export enum PhotoCategory {
  FRONT_VIEW = "tampak_depan",
  STREET_VIEW = "dari_jalan",
  ROOM_VIEW = "dalam_bangunan",
}

export interface IPhotoKost extends Document {
  kost: mongoose.Types.ObjectId | string;
  owner: Schema.Types.ObjectId | string;
  category: string;
  url: string;
  publicId: string;
}

const PhotoKostSchema: Schema = new Schema<IPhotoKost>({
  kost: { type: Schema.Types.ObjectId, ref: "Kost", required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: String,
    enum: Object.values(PhotoCategory),
    required: true,
  },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
});

export const PhotoKost = mongoose.model<IPhotoKost>(
  "PhotoKost",
  PhotoKostSchema
);
