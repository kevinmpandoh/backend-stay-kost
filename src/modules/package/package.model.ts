import { Schema, model, Document, Types } from "mongoose";

interface IPackageDuration {
  duration: number; // bulan
  price: number; // harga total
  discount?: string;
  oldPrice?: number;
}

export interface IPackage extends Document {
  _id: Types.ObjectId;
  name: string; // Nama paket, misalnya "Basic", "Pro", "Enterprise"
  description?: string; // deskripsi tambahan
  type: string; // free, pro, premium
  price: number; // harga langganan
  durations: IPackageDuration[];

  features: string[]; // list fitur yang didapat
  maxKost?: number; // maksimal kost yang bisa dikelola
  maxRoom?: number; // maksimal kamar yang bisa ditambahkan
  prioritySupport?: boolean; // contoh: dapat support khusus

  isActive: boolean; // apakah paket bisa dipilih atau tidak
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true },
    description: { type: String },
    features: [{ type: String }],
    type: { type: String, enum: ["free", "pro", "premium"], default: "pro" },
    durations: [
      {
        duration: { type: Number, required: true },
        price: { type: Number, required: true },
        discount: { type: String },
        oldPrice: { type: Number },
      },
    ],

    maxKost: { type: Number },
    maxRoom: { type: Number },
    prioritySupport: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Package = model<IPackage>("Package", PackageSchema);
