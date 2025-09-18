import mongoose, { Schema, Document } from "mongoose";

const { ObjectId } = Schema.Types;

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export interface IPayment extends Document {
  _id: Schema.Types.ObjectId;
  invoice: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId | string;

  amount: number;
  provider: string; // contoh: "midtrans", "manual", "bca_va", "gopay", dsb
  method: string;
  channel: string; // channel pembayaran, misal: "bca_va", "gopay", "ovo", dsb

  externalId: string; // ID dari Midtrans (transaction_id / order_id)
  vaNumber?: string; // untuk VA BCA/BNI/BRI
  billKey?: string; // nama bank kalau VA
  billerCode?: string;
  qrisUrl?: string; // URL gambar QR Code
  ewalletLink?: string; // Link untuk GoPay, OVO, Dana, dll

  status: PaymentStatus;
  paidAt: Date;
  expiredAt: Date;

  description?: string; // Deskripsi tambahan
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    invoice: { type: ObjectId, ref: "Invoice", required: true }, // Tagihan yang dibayar
    user: { type: ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true },

    // Metode pembayaran
    provider: { type: String, required: true }, // contoh: "midtrans", "manual", "bca_va", "gopay", dsb
    method: {
      type: String,
      enum: ["bank_transfer", "echannel", "ewallet", "credit_card", "offline"],
      required: true,
    },
    channel: { type: String },
    externalId: { type: String, required: true }, // ID dari Midtrans (transaction_id / order_id)

    // Data tambahan dari gateway
    vaNumber: { type: String }, // untuk VA BCA/BNI/BRI
    billKey: { type: String }, //
    billerCode: { type: String },
    qrisUrl: { type: String }, // URL gambar QR Code
    ewalletLink: { type: String }, // Link untuk GoPay, OVO, Dana, dll.

    // Status pembayaran
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paidAt: { type: Date }, // kapan benar-benar sukses
    expiredAt: { type: Date }, // kapan VA/link bayar kadaluarsa

    // Metadata tambahan
    description: { type: String }, // contoh: "Pembayaran sewa bulan Sept"
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
