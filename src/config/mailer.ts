import { env } from "./env";
import { Resend } from "resend";

const resend = new Resend("re_W2dnVwd4_5wyNBQyeHYQG5z3eHWfTMRVJ");

export async function sendMail(to: string, subject: string, html: string) {
  const info = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  if (env.NODE_ENV !== "production") console.log("Email sent:", info);
}
