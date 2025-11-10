import { env } from "./env";
import { Resend } from "resend";

const resend = new Resend("re_W2dnVwd4_5wyNBQyeHYQG5z3eHWfTMRVJ");

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
}

export async function sendMail({
  to,
  subject,
  html,
  cc,
  bcc,
}: SendMailOptions) {
  try {
    const info = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      cc,
      bcc,
    });

    if (env.NODE_ENV !== "production") {
      console.log("📧 Email sent:", info);
    }

    return info;
  } catch (error: any) {
    console.error("❌ Failed to send email:", error.message);
    // Bisa ditambahkan retry atau simpan ke log table
    throw new Error("Gagal mengirim email, coba lagi nanti.");
  }
}
