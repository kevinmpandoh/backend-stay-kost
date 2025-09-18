import Joi from "joi";

export const createRoomSchema = Joi.object({
  number: Joi.string().required(),
  floor: Joi.number().min(1).required(),
  status: Joi.string().valid("available", "occupied", "maintenance").required(),
});

export const updateRoomSchema = Joi.object({
  number: Joi.string().optional(),
  floor: Joi.number().min(1).optional(),
  status: Joi.string().valid("available", "occupied", "maintenance").optional(),
});
