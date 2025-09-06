import Joi from "joi";
import { PhotoCategory } from "./photo-kost.model";

export const uploadPhotoKostSchema = Joi.object({
  category: Joi.string()
    .valid(
      PhotoCategory.FRONT_VIEW,
      PhotoCategory.ROOM_VIEW,
      PhotoCategory.STREET_VIEW
    )
    .required()
    .messages({
      "any.only":
        "Foto kost harus 'Tampak Depan', 'Dalam Bangunan', atau 'Dari jalan'",
      "any.required": "Foto kost wajib diisi",
    }),

  kostId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Kost ID harus berupa ObjectId yang valid",
    "string.length": "Kost ID harus terdiri dari 24 karakter",
    "any.required": "Kost ID wajib diisi",
  }),
});
