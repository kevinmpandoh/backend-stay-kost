import Joi from "joi";

export const RuleValidation = {
  updateRuleSchema: Joi.object({
    name: Joi.string().min(3).max(50),
  }),
  createRuleSchema: Joi.object({
    name: Joi.string().min(3).max(50).required(),
  }),
};
