import { sendMail, transporter } from "@/config/mailer";
import { redis } from "@/config/redis";
import { generateOtp, OTP_COOLDOWN, OTP_TTL } from "@/utils/otp";
import { otpTemplate } from "@/utils/email-template";
import { ResponseError } from "@/utils/response-error.utils";
// import { sendEmail } from "../../utils/sendEmail";

// Struktur data sementara disimpan di Redis sebagai JSON string
// key: reg:otp:<email>

// keys action
const enum K {
  REG = "reg:otp",
  COOLDOWN = "reg:cooldown",
}

export async function sendRegistrationOtp(
  email: string,
  name: string,
  payload: any
) {
  // Rate limit via cooldown key
  const cooldownKey = `${K.COOLDOWN}:${email}`;
  const cooldown = await redis.ttl(cooldownKey);
  if (cooldown > 0) {
    throw new ResponseError(
      400,
      `Terlalu sering meminta OTP. Coba lagi dalam ${cooldown} detik.`
    );
  }

  const otp = generateOtp();
  const key = `${K.REG}:${email}`;
  await redis.set(key, JSON.stringify({ ...payload, otp }), "EX", OTP_TTL);
  await redis.set(cooldownKey, "1", "EX", OTP_COOLDOWN);

  // await transporter.sendMail({
  //   from: `"Aplikasi Kost" <${process.env.SMTP_USER}>`,
  //   to: email,
  //   subject: "Kode OTP Verifikasi - Aplikasi Kost",
  //   html: otpTemplate(payload.name, otp),
  // });

  await sendMail(email, "Verifikasi Akun Kost", otpTemplate(name, otp));
  return { sent: true };
}

export async function readRegistration(email: string) {
  const key = `reg:otp:${email}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function resendOtp(email: string) {
  // Just trigger cooldown check by calling sendRegistrationOtp with previous payload
  const current = await redis.get(`${K.REG}:${email}`);
  if (!current) throw new ResponseError(400, "Tidak ada pendaftaran pending");
  const payload = JSON.parse(current);
  return sendRegistrationOtp(email, payload.name, payload);
}

export async function verifyRegistration(email: string, otp: string) {
  const key = `reg:otp:${email}`;
  const data = await redis.get(key);
  if (!data) return { ok: false, reason: "expired" } as const;
  const parsed = JSON.parse(data);
  if (parsed.otp !== otp) return { ok: false, reason: "mismatch" } as const;
  await redis.del(key);
  return { ok: true, payload: parsed } as const;
}
