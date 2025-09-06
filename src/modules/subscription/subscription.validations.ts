import Joi from "joi";

export const createSubscriptionSchema = Joi.object({
  packageId: Joi.string().hex().length(24).required(), // ObjectId
});
