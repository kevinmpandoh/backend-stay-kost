import Joi from "joi";

export const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(5).max(500).required(),
});

export const createReplyReviewSchema = Joi.object({
  message: Joi.string().min(5).max(500).required(),
});

export const queryFilterReviewSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  search: Joi.string().allow("").trim().optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
});
