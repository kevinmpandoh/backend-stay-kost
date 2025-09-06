import Joi from "joi";

export const createFacilitySchema = Joi.object({
  name: Joi.string(),
  category: Joi.string().valid("common", "room").required(),
});

export const updateFacilitySchema = Joi.object({
  name: Joi.string(),
  category: Joi.string().valid("common", "room"),
});
