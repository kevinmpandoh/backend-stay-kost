// src/modules/kost/kost.type.ts

import { Types } from "mongoose";

export enum KostStatus {
  PENDING = "pending",
  EXPIRED = "expired",
  APPROVED = "approved",
  REJECTED = "rejected",
  DRAFT = "draft",
}

export enum KostType {
  PUTRI = "putri",
  PUTRA = "putra",
  CAMPUR = "campur",
}

export interface Address {
  province: string;
  city: string;
  district: string;
  detail: string;
  note?: string;
  coordinates?: object;
}

export interface createKost {
  name: string;
  description: string;
  type: KostType;
  rules?: Types.ObjectId[];
}
