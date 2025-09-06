import jwt from "jsonwebtoken";

import { env } from "@/config/env";

type Payload = { id: string; role: "admin" | "owner" | "tenant" };

export const generateAccessToken = (payload: Payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (payload: Payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyAccess = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as Payload;
export const verifyRefresh = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as Payload;
