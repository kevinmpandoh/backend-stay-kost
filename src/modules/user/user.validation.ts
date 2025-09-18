import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().required().min(3).max(50).messages({
    "string.empty": "Nama tidak boleh kosong",
    "string.min": "Nama minimal 3 karakter",
    "string.max": "Nama maksimal 50 karakter",
    "any.required": "Nama wajib diisi",
  }),
  gender: Joi.string().valid("male", "female", "").messages({
    "any.only": "Jenis kelamin tidak valid",
  }),
  birthDate: Joi.date()
    .less("now")
    .messages({
      "date.base": "Tanggal lahir tidak valid",
      "date.less": "Tanggal lahir harus di masa lalu",
    })
    .allow(null, ""),
  job: Joi.string().max(100).messages({
    "string.max": "Pekerjaan maksimal 100 karakter",
  }),
  otherJob: Joi.string().max(100).allow(""),
  hometown: Joi.string().max(100).messages({
    "string.max": "Kota asal maksimal 100 karakter",
  }),
  emergencyContact: Joi.string()
    .pattern(/^[0-9+\-() ]*$/)
    .min(6)
    .max(20)
    .messages({
      "string.pattern.base":
        "Kontak darurat hanya boleh berisi angka, spasi, +, -, dan ()",
      "string.min": "Kontak darurat minimal 6 karakter",
      "string.max": "Kontak darurat maksimal 20 karakter",
    })
    .allow(null, ""),
});

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
