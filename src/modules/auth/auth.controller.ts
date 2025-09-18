import { Request, Response, NextFunction } from "express";
import * as service from "./auth.service";
import * as passwordService from "./password.service";
import { clearAuthCookies, setAuthCookies } from "@/utils/cookies";
import passport from "passport";
import { IUser } from "../user/user.model";
import { env } from "@/config/env";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await service.registerRequest(req.body);
    res.status(201).json({
      status: "success",
      message: "OTP terkirim ke email. Silakan verifikasi.",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

export async function verifyOtp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, otp } = req.body as { email: string; otp: string };
    const result = await service.verifyOtpAndCreateUser(email, otp);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
        role: result.user.role,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.login(req.body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
        role: result.user.role,
      },
    });
  } catch (e) {
    next(e);
  }
}
export async function loginAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await service.loginAdmin(req.body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
        role: result.user.role,
      },
    });
  } catch (e) {
    next(e);
  }
}

export const googleCallbackRedirect = [
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  async (req: any, res: any, next: any) => {
    try {
      const user: IUser = req.user;

      if (!user) {
        return res.redirect(`${env.FRONTEND_URL}/login?error=unauthorized`);
      }

      const { accessToken, refreshToken } = await service.loginWithGoogle(
        req.user
      );

      setAuthCookies(res, accessToken, refreshToken);

      res.redirect(`${env.FRONTEND_URL}/`);
    } catch (err) {
      // kalau error, redirect ke halaman login dengan query error
      console.error(err);
      res.redirect(`${env.FRONTEND_URL}/login?error=server_error`);
    }
  },
];

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.cookies;

    const tokens = await service.refresh(refreshToken);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json(tokens);
  } catch (e) {
    next(e);
  }
}

export async function resendOTP(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body as { email: string };
    const result = await service.resendOtpService(email);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = (req as any).cookies?.refreshToken;
    if (refreshToken && req.user?.id)
      await service.logout(req.user.id, refreshToken);
    clearAuthCookies(res);
    res.json({ message: "Logout sukses" });
  } catch (e: any) {
    next(e);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body as { email: string };
    await passwordService.requestReset(email);
    res.json({
      message: "Permintaan reset password berhasil. Cek email Anda.",
    });
  } catch (e: any) {
    next(e);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token, newPassword } = req.body as {
      token: string;
      newPassword: string;
    };
    await passwordService.resetPassword(token, newPassword);
    res.json({ message: "Password berhasil diubah. Silakan login." });
  } catch (e: any) {
    next(e);
  }
}
