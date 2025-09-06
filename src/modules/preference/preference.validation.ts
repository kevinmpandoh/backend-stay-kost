import Joi from "joi";
import { KostType } from "../kost/kost.type";

export const preferenceSchema = Joi.object({
  address: Joi.object({
    type: Joi.string().valid("map", "address").default("map").required(),
    province: Joi.string().when("type", {
      is: "address",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    city: Joi.string().when("type", {
      is: "address",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    district: Joi.string().when("type", {
      is: "address",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).when("type", {
      is: "map",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  }).required(),
  price: Joi.object({
    min: Joi.number().required().min(0),
    max: Joi.number().required().greater(Joi.ref("min")),
  }).required(),

  kostType: Joi.string()
    .valid(KostType.PUTRA, KostType.PUTRI, KostType.CAMPUR)
    .required(),
  kostFacilities: Joi.array().items(Joi.string().hex().length(24)).required(),
  roomFacilities: Joi.array().items(Joi.string().hex().length(24)).required(),
  rules: Joi.array().items(Joi.string().hex().length(24)).required(),
});
