// src/lib/resend.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "EduSmart Pro <onboarding@resend.dev>";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  if (!resend) {
    console.warn(
      `[Resend] RESEND_API_KEY not configured. Email not sent to ${Array.isArray(options.to) ? options.to.join(", ") : options.to}. Subject: "${options.subject}"`
    );
    return { success: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || "shanibrooo@gmail.com",
    });

    if (error) {
      console.error("[Resend] Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend] Exception during email transmission:", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}
