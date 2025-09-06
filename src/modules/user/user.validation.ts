import Joi from "joi";

export const bankAccountSchema = Joi.object({
  bank: Joi.string()
    .required()
    .valid(
      "bca",
      "bni",
      "bri",
      "mandiri",
      "cimb",
      "danamon",
      "permata",
      "gopay",
      "cimb_va",
      "ovo"
    )
    .messages({
      "any.required": "Bank wajib diisi",
      "any.only": "Bank tidak valid",
    }),
  account: Joi.string()
    .required()
    .min(6)
    .max(20)
    .pattern(/^[0-9]+$/)
    .messages({
      "string.pattern.base": "Nomor rekening hanya boleh angka",
      "string.min": "Nomor rekening minimal 6 digit",
      "string.max": "Nomor rekening maksimal 20 digit",
    }),
});
