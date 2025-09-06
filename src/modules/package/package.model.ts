import { Schema, model, Document, Types } from "mongoose";

export interface IPackage extends Document {
  _id: Types.ObjectId;
  name: string; // Nama paket, misalnya "Basic", "Pro", "Enterprise"
  description?: string; // deskripsi tambahan

  price: number; // harga langganan
  duration: number; // lama berlangganan dalam hari/bulan (misalnya 30 = 1 bulan)

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

    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // dalam hari

    features: [{ type: String }],
    maxKost: { type: Number },
    maxRoom: { type: Number },
    prioritySupport: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Package = model<IPackage>("Package", PackageSchema);
