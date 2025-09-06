import mongoose, { Schema, Document } from "mongoose";

export interface IFacility extends Document {
  name: string;
  category: string;
}

const FacilitySchema: Schema = new Schema<IFacility>({
  name: { type: String, required: true },
  category: { type: String, required: true },
});

export const Facility = mongoose.model<IFacility>("Facility", FacilitySchema);
