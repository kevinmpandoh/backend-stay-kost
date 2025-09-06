import Joi from "joi";
import { PhotoRoomCategory } from "./photo-room.model";

export const uploadPhotoRoomSchema = Joi.object({
  category: Joi.string()
    .valid(
      PhotoRoomCategory.FRONT_ROOM,
      PhotoRoomCategory.INSIDE_ROOM,
      PhotoRoomCategory.BATH_ROOM
    )
    .required()
    .messages({
      "any.only": `Foto kamar harus satu dari antara '${PhotoRoomCategory.FRONT_ROOM}', '${PhotoRoomCategory.INSIDE_ROOM}', atau '${PhotoRoomCategory.BATH_ROOM}'`,
      "any.required": "Foto kost wajib diisi",
    }),

  roomTypeId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Kost ID harus berupa ObjectId yang valid",
    "string.length": "Kost ID harus terdiri dari 24 karakter",
    "any.required": "Id Tipe Kamar wajib diisi",
  }),
});
