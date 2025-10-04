import mongoose, { Schema, Document } from "mongoose";
import { KostType } from "../kost/kost.type";

export interface IPreference extends Document {
  tenant: mongoose.Types.ObjectId;
  address: {
    type: string;
    province: string;
    city: string;
    district: string;
    coordinates: { lat: number; lng: number };
  };
  kostType: KostType;
  // price: number;
  price: {
    min: number;
    max: number;
  };
  kostFacilities: mongoose.Types.ObjectId[];
  roomFacilities: mongoose.Types.ObjectId[];
  rules: mongoose.Types.ObjectId[];
}

const PreferenceSchema: Schema = new Schema<IPreference>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address: {
      type: { type: String, required: true },
      province: { type: String },
      city: { type: String },
      district: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    price: { type: Number, required: true },
    // price: {
    //   min: { type: Number, required: true },
    //   max: { type: Number, required: true },
    // },
    kostType: {
      type: String,
      enum: Object.values(KostType),
      required: true,
    },
    kostFacilities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facility" }],
    roomFacilities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facility" }],
    // rules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rule" }],
  },
  { timestamps: true }
);

export const Preference = mongoose.model<IPreference>(
  "Preference",
  PreferenceSchema
);
