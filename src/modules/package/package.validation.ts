import Joi from "joi";

export const createPackageSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().allow("").optional(),

  price: Joi.number().positive().required(),
  duration: Joi.number().positive().required(), // misalnya dalam hari

  features: Joi.array().items(Joi.string()).default([]),
  maxKost: Joi.number().integer().min(1).allow(null).optional(),
  maxRoomType: Joi.number().integer().min(1).allow(null).optional(),
  maxRoom: Joi.number().integer().min(1).allow(null).optional(),

  isActive: Joi.boolean().default(true),
});

export const updatePackageSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  description: Joi.string().allow("").optional(),

  price: Joi.number().positive().optional(),
  duration: Joi.number().positive().optional(),

  features: Joi.array().items(Joi.string()).optional(),
  maxKost: Joi.number().integer().min(1).allow(null).optional(),
  maxRoomType: Joi.number().integer().min(1).allow(null).optional(),
  maxRoom: Joi.number().integer().min(1).allow(null).optional(),

  isActive: Joi.boolean().optional(),
});
