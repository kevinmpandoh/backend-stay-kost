import Joi from "joi";

export const createBookingSchema = Joi.object({
  roomType: Joi.string().hex().length(24).required(),
  startDate: Joi.date().iso().required(),
  duration: Joi.number().integer().min(1).required(),
  note: Joi.string().optional().allow(""),
});

export const updateBookingSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
});

export const approveBookingSchema = Joi.object({
  room: Joi.string().hex().length(24).required(),
  bookingId: Joi.string().hex().length(24).required(),
});

export const stopRentRequestSchema = Joi.object({
  stopDate: Joi.date().iso().required(),
  reason: Joi.string().required(),
});

export const confirmStopRequest = Joi.object({
  confirm: Joi.boolean().optional(),
  reason: Joi.string().min(3).max(500).optional(),
});

export const extendBookingSchema = Joi.object({
  durasi: Joi.number().integer().min(1).required(),
});

export const rejectBookingSchema = Joi.object({
  rejectionReason: Joi.string().required(),
});

export const queryFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  search: Joi.string().allow("").trim().optional(),
  status: Joi.string().allow("").trim().optional(),
  kostId: Joi.string().optional(),
});
