import { Schema, Types, model, Document } from "mongoose";

export interface ITenant extends Document {
  user: Types.ObjectId | string;
  gender?: "male" | "female";
  hometown?: string;
  emergencyContact?: string;
  job?: string;
  documment?: string;
}

const tenantSchema = new Schema<ITenant>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gender: { type: String, enum: ["male", "female"] },
    hometown: String,
    emergencyContact: String,
    job: String,
    documment: String,
  },
  { timestamps: true }
);

export const Tenant = model<ITenant>("Tenant", tenantSchema);
