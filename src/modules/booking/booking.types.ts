import { Types } from "mongoose";

export enum BookingStatus {
  PENDING = "pending",
  EXPIRED = "expired",
  APPROVED = "approved",
  REJECTED = "rejected",
  WAITING_FOR_PAYMENT = "waiting_for_payment",
  WAITING_FOR_CHECKIN = "waiting_for_checkin",
  ACTIVE = "active",
  WAITING_FOR_CHECKOUT = "waiting_for_checkout",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum StopRequestStatus {
  PENDING = "pending_approval",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface CreateBookingPayload {
  roomType: string;
  startDate: string; // ISO date
  duration: number;
  note?: string;
  idDocument?: string;
}

export interface UpdateBookingPayload {
  duration: number;
  startDate: Date;
  endDate: Date;
}

interface CheckInPayload {
  bookingId: string;
  tenantId: string;
}

interface CheckOutPayload {
  bookingId: string;
  tenantId: string;
}
