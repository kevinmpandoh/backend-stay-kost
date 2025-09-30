import { Response } from "express";
import { env } from "../config/env";

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  const common = {
    httpOnly: true as const,
    // secure: true,
    sameSite: "none" as const,
    secure: env.COOKIE_SECURE,
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
    secure: false,
    // secure: env.COOKIE_SECURE,
    // domain: env.COOKIE_DOMAIN,
  });
  res.clearCookie("refreshToken", {
    path: "/",
    sameSite: "none",
    secure: false,
    // secure: env.COOKIE_SECURE,
    // domain: env.COOKIE_DOMAIN,
  });
}
