import { redis } from "@/config/redis";

import { sendMail } from "@/config/mailer";
import { resetPasswordTemplate } from "@/utils/email-template";
import crypto from "crypto";
import { env } from "@/config/env";
import { User } from "../user/user.model";
// import bcrypt from "bcryptjs";
import { ResponseError } from "@/utils/response-error.utils";

const RESET_NS = "reset:token"; // reset:token:<token> => userId
const RESET_TTL = 60 * 15; // 15 minutes

export async function requestReset(email: string) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ResponseError(404, "User not found"); // do not reveal existence)
  } // do not reveal existence

  const token = crypto.randomBytes(32).toString("hex");
  await redis.set(`${RESET_NS}:${token}`, user._id.toString(), "EX", RESET_TTL);
  const link = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendMail(
    email,
    "Reset Password",
    resetPasswordTemplate(user.name, link)
  );
}

export async function resetPassword(token: string, newPassword: string) {
  const key = `${RESET_NS}:${token}`;
  const userId = await redis.get(key);
  if (!userId)
    throw new ResponseError(400, "Token tidak valid atau kadaluarsa");
  const user = await User.findById(userId);
  if (!user) throw new ResponseError(404, "User tidak ditemukan");
  user.password = newPassword;
  await user.save();
  await redis.del(key);
}
