import { authRepository } from "./auth.repository";

import {
  verifyRegistration,
  readRegistration,
  sendRegistrationOtp,
  resendOtp,
} from "./otp.service";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefresh,
} from "@/utils/jwt.utils";
import { IUser, User } from "../user/user.model";
import { ResponseError } from "@/utils/response-error.utils";
import { subscriptionRepository } from "../subscription/subscription.repository";
import { packageRepository } from "../package/package.repository";

export async function registerRequest(input: any) {
  const exists = await authRepository.findByEmail(input.email);
  if (exists)
    throw new ResponseError(400, "Email sudah terdaftar", {
      email: "Email sudah terdaftar",
    });

  // Simpan sementara di Redis + kirim OTP
  await sendRegistrationOtp(input.email, input.name, input);
  return {
    phone: input.phone,
    email: input.email,
  };
}

export async function verifyOtpAndCreateUser(email: string, otp: string) {
  const result = await verifyRegistration(email, otp);
  if (!result.ok) {
    if (result.reason === "expired")
      throw new ResponseError(400, "OTP kadaluarsa, silakan daftar ulang");
    throw new ResponseError(400, "OTP tidak valid");
  }

  const payload = result.payload;
  // Buat user permanen di DB (password akan di-hash oleh pre-save hook)
  const user = await authRepository.createUser({
    name: payload.name,
    email,
    phone: payload.phone,
    password: payload.password,
    role: payload.role,
    isVerified: true,
  });

  if (user.role === "owner") {
    const freePackage = await packageRepository.findOne({
      type: "free",
      isActive: true,
    });
    if (!freePackage) {
      throw new ResponseError(
        404,
        "Free package not found. Please seed the package first."
      );
    }
    await subscriptionRepository.create({
      owner: user._id,
      package: freePackage._id,
      duration: 0,
      status: "active",
      startDate: new Date(),
      endDate: null,
    });
  }

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    role: payload.role,
  });
  const refreshToken = generateRefreshToken({
    id: user._id.toString(),
    role: payload.role,
  });

  await authRepository.addRefreshToken(payload.id, refreshToken);
  return { accessToken, refreshToken, user };
}

export async function login({
  email,
  password,
  role,
}: {
  email: string;
  password: string;
  role: string;
}) {
  const user = await authRepository.findByEmailAndRole(email, role);
  if (!user) throw new ResponseError(400, "Email atau password salah");
  if (!user.isVerified) throw new ResponseError(403, "Akun belum diverifikasi");

  const match = await user.comparePassword(password);
  if (!match) throw new ResponseError(400, "Email atau password salah");

  const payload = { id: user._id.toString(), role: user.role } as const;
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await authRepository.addRefreshToken(payload.id, refreshToken);

  return { accessToken, refreshToken, user };
}
export async function loginAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await authRepository.findByEmailAndRole(email, "admin");
  if (!user) throw new ResponseError(400, "Email atau password salah");
  if (!user.isVerified) throw new ResponseError(403, "Akun belum diverifikasi");

  const match = await user.comparePassword(password);
  if (!match) throw new ResponseError(400, "Email atau password salah");

  const payload = { id: user._id.toString(), role: user.role } as const;
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await authRepository.addRefreshToken(payload.id, refreshToken);

  return { accessToken, refreshToken, user };
}

export async function loginWithGoogle(user: IUser) {
  if (!user.isVerified) {
    throw new ResponseError(403, "Akun belum diverifikasi");
  }

  const payload = { id: user._id.toString(), role: user.role } as const;
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await authRepository.addRefreshToken(payload.id, refreshToken);

  return { accessToken, refreshToken, user };
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefresh(refreshToken);
  const user = await User.findById(payload.id);

  if (!user) throw new ResponseError(404, "User tidak ditemukan");

  if (!user.refreshTokens.includes(refreshToken))
    throw new ResponseError(401, "Refresh token tidak valid");

  const newAccess = generateAccessToken({
    id: user._id.toString(),
    role: user.role,
  });
  // const newRefresh = generateRefreshToken({
  //   id: user._id.toString(),
  //   role: user.role,
  // });

  // await authRepository.removeRefreshToken(user._id.toString(), refreshToken);
  // await authRepository.addRefreshToken(user._id.toString(), newRefresh);
  return { accessToken: newAccess, refreshToken };
}

export async function resendOtpService(email: string) {
  await resendOtp(email);
  return { message: "OTP baru telah dikirim" };
}

export async function logout(userId: string, refreshToken: string) {
  await authRepository.removeRefreshToken(userId, refreshToken);
}
