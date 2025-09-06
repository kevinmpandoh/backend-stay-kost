import mongoose, { Schema, Types } from "mongoose";
import { BookingStatus, StopRequestStatus } from "./booking.types";

export interface IBooking extends Document {
  _id: Types.ObjectId;
  tenant: Types.ObjectId | string;
  owner: Types.ObjectId | string;
  kost: Types.ObjectId;
  roomType: Types.ObjectId | string;
  room?: Types.ObjectId;

  startDate: Date | string;
  endDate: Date;
  duration: number;

  status: BookingStatus;
  stopRequest?: {
    status: StopRequestStatus;
    requestedStopDate: Date;
    reason?: string;
  };

  note?: string;
  totalPrice: number;
  invoices: Types.ObjectId;

  paymentDeadline?: Date | null;
  confirmDueDate: Date;
  confirmedAt?: Date;
  checkInAt: Date;
  checkOutAt: Date;
  rejectionReason?: string;
  idDocument?: string;
  reviewed?: boolean;
  createdAt: Date;
  updatedAt: Date;
  firstInvoice: Object;
}

const BookingSchema: Schema = new Schema<IBooking>(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kost: {
      type: Schema.Types.ObjectId,
      ref: "Kost",
      required: true,
    },
    roomType: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number, required: true },

    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    rejectionReason: { type: String, default: null },
    idDocument: { type: String },

    paymentDeadline: { type: Date, default: null },
    confirmDueDate: { type: Date },
    confirmedAt: { type: Date },
    checkInAt: { type: Date, default: null },
    checkOutAt: { type: Date, default: null },

    totalPrice: { type: Number, required: true },
    reviewed: { type: Boolean, default: false },
    firstInvoice: { type: Schema.Types.ObjectId, ref: "Invoice" },

    stopRequest: {
      status: {
        type: String,
        enum: Object.values(StopRequestStatus),
      },
      requestedStopDate: { type: Date },
      reason: { type: String },
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
