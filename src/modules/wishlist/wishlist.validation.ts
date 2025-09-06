import Joi from "joi";

export const createWishlistSchema = Joi.object({
  kost_type: Joi.string().hex().length(24).required(),
});
