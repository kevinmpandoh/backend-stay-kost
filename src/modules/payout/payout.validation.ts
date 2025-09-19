import Joi from "joi";

export const createPayoutSchema = Joi.object({
  owner: Joi.string().hex().length(24).required(),
  payment: Joi.string().hex().length(24).required(),
});
export const updateBeneficiariesSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama pemilik rekening tidak boleh kosong",
    "any.required": "Nama pemilik rekening harus diisi",
  }),
  account: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.empty": "Nomor rekening tidak boleh kosong",
      "any.required": "Nomor rekening harus diisi",
      "string.pattern.base": "Nomor rekening hanya boleh berisi angka",
    }),
  bank: Joi.string().required().messages({
    "string.empty": "Nama bank tidak boleh kosong",
    "any.required": "Nama bank harus diisi",
  }),
  email: Joi.string().email().required(),
});

export const queryFilterPayoutSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  search: Joi.string().allow("").trim().optional(),
  status: Joi.string().allow("").trim().optional(),
});
