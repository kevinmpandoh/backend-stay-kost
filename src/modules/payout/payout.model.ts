import mongoose, { Schema, Document, Types } from "mongoose";
import { PayoutStatus } from "./payout.type";

const { ObjectId } = Schema.Types;

export interface IPayout extends Document {
  _id: Types.ObjectId;
  payoutNumber: string; // PO-202508-0001
  owner: Types.ObjectId | string; // penerima uang
  invoice: Types.ObjectId | string;

  amount: number; // total sewa
  platformFee: number; // potongan platform
  netAmount: number; // amount - fee
  currency: string;

  provider: string; // midtrans, xendit, manual
  method: string; // transfer_bank, ewallet, manual
  channel: string; // BCA, Mandiri, OVO, dll

  accountNumber: string;
  accountName: string;

  status: PayoutStatus;
  requestedAt: Date;
  transferredAt?: Date;
  failedReason?: string;
  visibleFailedReason?: string;
  isInternalError: boolean;
  note?: string;

  externalId?: string; // ID dari provider (misalnya disbursement_id Midtrans)
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    payoutNumber: { type: String, unique: true, required: true },
    owner: { type: ObjectId, ref: "User", required: true },
    invoice: { type: ObjectId, ref: "Invoice", required: true },

    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    currency: { type: String, default: "IDR" },

    provider: { type: String, required: true }, // midtrans/xendit/manual
    method: { type: String }, // transfer_bank/ewallet/manual
    channel: { type: String }, // bca, mandiri, ovo, dll

    accountNumber: { type: String },
    accountName: { type: String },

    status: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.PENDING,
    },
    requestedAt: { type: Date, default: Date.now },
    transferredAt: { type: Date },
    failedReason: { type: String },
    visibleFailedReason: { type: String },
    isInternalError: { type: Boolean },
    note: { type: String },

    externalId: { type: String },
  },
  { timestamps: true }
);

export const Payout = mongoose.model<IPayout>("Payout", PayoutSchema);
