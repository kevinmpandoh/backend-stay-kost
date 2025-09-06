export const OTP_TTL = 60 * 5; // 5 minutes
export const OTP_COOLDOWN = 60; // 60s cooldown per email
export function generateOtp(len = 6) {
  return Math.floor(Math.random() * 10 ** len)
    .toString()
    .padStart(len, "0");
}
