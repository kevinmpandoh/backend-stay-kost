import Joi from "joi";
const campusLocations: Record<
  string,
  { name: string; coordinates: [number, number] }
> = {
  unima: {
    name: "Universitas Negeri Manado",
    coordinates: [124.9225, -1.3101], // [lng, lat]
  },
  unsrat: {
    name: "Universitas Indonesia",
    coordinates: [106.8272, -6.3659],
  },
  // tambahkan kampus lain di sini
};

export const createRoomTypeSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Nama tipe kost tidak boleh kosong",
    "string.min": "Nama tipe kost minimal 3 karakter",
    "string.max": "Nama tipe kost maksimal 100 karakter",
    "any.required": "Nama tipe kost wajib diisi",
  }),
  size: Joi.string().max(100).required().messages({
    "string.max": "Deskripsi maksimal 100 karakter",
    "any.required": "Ukuran Kamar wajib diisi",
  }),
  total_rooms: Joi.number().integer().min(1).required().messages({
    "any.required": "Jumlah Kamar wajib diisi",
  }),
  total_rooms_occupied: Joi.number()
    .integer()
    .min(0)
    .custom((value, helpers) => {
      const { total_rooms } = helpers.state.ancestors[0];
      if (value > total_rooms) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.invalid": "Jumlah kamar terisi tidak boleh lebih dari total kamar",
      "any.required": "Jumlah kamar terisi wajib diisi",
    }),
  // price: Joi.number().min(0).required().messages({
  //   "number.base": "Harga harus berupa angka",
  //   "number.min": "Harga minimal adalah 0",
  //   "any.required": "Harga wajib diisi",
  // }),
  // kost: Joi.string().hex().length(24).required().messages({
  //   "string.hex": "Kost ID harus berupa ObjectId yang valid",
  //   "string.length": "Kost ID harus terdiri dari 24 karakter",
  //   "any.required": "Kost ID wajib diisi",
  // }),
});

export const updateRoomTypeFacilitiesSchema = Joi.object({
  facilities: Joi.array().items(Joi.string().hex().length(24)).required(),
});

export const updatePriceSchema = Joi.object({
  price: Joi.number().min(50000).max(15000000).required(),
});

export const roomTypeFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),

  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),

  kostType: Joi.array().items(Joi.string()).optional(),
  kostFacilities: Joi.array().items(Joi.string()).optional(), // comma-separated object IDs
  roomFacilities: Joi.array().items(Joi.string()).optional(), // comma-separated object IDs
  rules: Joi.array().items(Joi.string()).optional(), // comma-separated rule names

  sort: Joi.string()
    .valid("price_asc", "price_desc", "rating_high", "recommended")
    .optional(),

  rating: Joi.number().min(0).max(5).optional(),
  search: Joi.string().allow("").trim().optional(),
});
