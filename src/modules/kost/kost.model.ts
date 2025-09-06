// src/modules/kost/kost.model.ts

import { Schema, Types, model } from "mongoose";
import { Address, KostStatus, KostType } from "./kost.type";

const coordinatesSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    province: { type: String },
    city: { type: String },
    district: { type: String },
    detail: { type: String },
    note: { type: String },
    coordinates: coordinatesSchema,
  },
  { _id: false }
);

export interface IKost extends Document {
  _id: Types.ObjectId | string;
  owner: Types.ObjectId | string; // Ref ke Owner
  name: string;
  description: string;
  type: KostType;
  address?: Address;
  rules?: Types.ObjectId[];
  facilities?: Types.ObjectId[] | string[];
  photos?: Types.ObjectId[];
  rejectionReason?: string;
  progressStep: number;
  isPublished: boolean;
  status: KostStatus;
  roomTypes: Types.ObjectId[];
}

const kostSchema = new Schema<IKost>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: Object.values(KostType), required: true },
    address: addressSchema,
    rules: [{ type: Schema.Types.ObjectId, ref: "Rule" }],
    facilities: [{ type: Schema.Types.ObjectId, ref: "Facility" }],
    photos: [{ type: Schema.Types.ObjectId, ref: "PhotoKost" }],
    rejectionReason: { type: String },
    progressStep: { type: Number, default: 1 },
    isPublished: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(KostStatus),
      default: KostStatus.DRAFT,
    },
    roomTypes: [{ type: Schema.Types.ObjectId, ref: "RoomType" }],
  },
  { timestamps: true }
);

kostSchema.index({ "address.coordinates": "2dsphere" });

export const Kost = model<IKost>("Kost", kostSchema);
