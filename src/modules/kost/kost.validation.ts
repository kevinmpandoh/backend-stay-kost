import Joi from "joi";
import { KostStatus, KostType } from "./kost.type";

export const createKostSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string()
    .valid(KostType.PUTRA, KostType.PUTRI, KostType.CAMPUR)
    .required(),
  rules: Joi.array().items(Joi.string()),
});

export const updateKostSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  type: Joi.string().valid(KostType.PUTRA, KostType.PUTRI, KostType.CAMPUR),
  rules: Joi.array().items(Joi.string()),
});

export const kostFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  search: Joi.string().allow("").trim().optional(),

  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),

  kostType: Joi.string().optional(),
  kostFacilities: Joi.string().optional(), // comma-separated object IDs
  roomFacilities: Joi.string().optional(), // comma-separated object IDs
  rules: Joi.string().optional(), // comma-separated rule names

  sort: Joi.string()
    .valid("price_asc", "price_desc", "rating_high", "recommended")
    .optional(),

  rating: Joi.number().min(1).max(5).optional(),
});

export const kostQueryFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().allow("").trim().optional(),
  status: Joi.string()
    .valid(
      KostStatus.PENDING,
      KostStatus.APPROVED,
      KostStatus.REJECTED,
      KostStatus.DRAFT
    )
    .optional(),
  city: Joi.string().allow("").trim().optional(),
  type: Joi.string()
    .valid(KostType.PUTRA, KostType.PUTRI, KostType.CAMPUR)
    .optional(),
  sort: Joi.string()
    .valid("date_asc", "date_desc", "name_asc", "name_desc")
    .optional(),
});

export const updateAddressKostSchema = Joi.object({
  province: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  detail: Joi.string().required(),
  note: Joi.string().optional(),
  coordinates: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).required(),
});
export const updatePhotoKostSchema = Joi.object({
  province: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  detail: Joi.string().required(),
  note: Joi.string().optional(),
  coordinates: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).required(),
});
export const updateFacilityKostSchema = Joi.object({
  facilities: Joi.array()
    .items(Joi.string().hex().length(24).required())
    .required(),
});

export const rejectKostSchema = Joi.object({
  rejectionReason: Joi.string().required(),
});
