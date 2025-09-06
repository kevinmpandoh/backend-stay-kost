import Joi from "joi";

export const createPaymentSchema = Joi.object({
  provider: Joi.string().required(),
  method: Joi.string()
    .valid("bank_transfer", "echannel", "offline", "ewallet", "credit_card")
    .required(),
  channel: Joi.string()
    .valid(
      "bni",
      "bri",
      "gopay",
      "qris",
      "mandiri",
      "bca",
      "permata",
      "cimb",
      "manual"
    )
    .required(),
});
