import mongoose, { Schema, Document, Types } from "mongoose";

const { ObjectId } = Schema.Types;

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  invoiceNumber: string; // nomor invoice unik
  user: Types.ObjectId | string; // penyewa atau owner
  type: "tenant" | "owner"; // jenis invoice

  booking?: Types.ObjectId | string; // kalau invoice tenant
  subscription?: Types.ObjectId | string; // kalau invoice owner

  amount: number;

  dueDate: Date; // batas bayar
  status: "unpaid" | "paid" | "overdue" | "cancelled";

  description?: string; // misalnya "Sewa Kost bulan September"
  metadata?: Record<string, any>; // fleksibel kalau ada info tambahan

  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, unique: true, required: true }, // contoh: INV-202508-0001
    user: { type: ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["tenant", "owner"], required: true },

    // Relasi opsional
    booking: { type: ObjectId, ref: "Booking" },
    subscription: { type: ObjectId, ref: "Subscription" },

    // Nominal
    amount: { type: Number, required: true },

    // Status lifecycle
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["unpaid", "partial", "paid", "overdue", "cancelled"],
      default: "unpaid",
    },

    description: { type: String },
    metadata: { type: Object }, // untuk fleksibilitas, misalnya simpan nama kost, bulan sewa, dll.
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<IInvoice>("Invoice", InvoiceSchema);
