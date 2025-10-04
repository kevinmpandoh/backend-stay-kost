import { Response } from "express";
import { env } from "../config/env";

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  const common = {
    httpOnly: true as const,
    secure: true,
    // secure: env.NODE_ENV !== "development" ? true : false,
    sameSite: "none" as const,
    // domain: env.COOKIE_DOMAIN,
  };
  res.cookie("accessToken", accessToken, {
    ...common,
    path: "/",
    maxAge: 1000 * 60 * 60,
  });
  res.cookie("refreshToken", refreshToken, {
    ...common,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", {
    path: "/",
    sameSite: "none",
    secure: true,
    // secure: env.COOKIE_SECURE,
    // domain: env.COOKIE_DOMAIN,
  });
  res.clearCookie("refreshToken", {
    path: "/",
    sameSite: "none",
    secure: true,
    // secure: env.COOKIE_SECURE,
    // domain: env.COOKIE_DOMAIN,
  });
}
