import Joi from "joi";

export const createRoomSchema = Joi.object({
  name: Joi.string(),
  category: Joi.string().valid("common", "room").required(),
});

export const updateRoomSchema = Joi.object({
  name: Joi.string(),
  category: Joi.string().valid("common", "room"),
});
