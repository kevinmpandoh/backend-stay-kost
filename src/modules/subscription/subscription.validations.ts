import Joi from "joi";

export const createSubscriptionSchema = Joi.object({
  packageId: Joi.string().hex().length(24).required(), // ObjectId
  duration: Joi.number().integer().min(1).required(), // in days
});
