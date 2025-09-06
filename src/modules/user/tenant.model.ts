import { Schema, Types, model, Document } from "mongoose";

export interface ITenant extends Document {
  user: Types.ObjectId | string;
  gender?: "male" | "female";
  kotaAsal?: string;
  emergencyContact?: string;
  pekerjaan?: string;
  fotoKTP?: string;
}

const tenantSchema = new Schema<ITenant>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gender: { type: String, enum: ["male", "female"] },
    kotaAsal: String,
    emergencyContact: String,
    pekerjaan: String,
    fotoKTP: String,
  },
  { timestamps: true }
);

export const Tenant = model<ITenant>("Tenant", tenantSchema);
