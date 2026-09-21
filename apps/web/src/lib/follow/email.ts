import { Resend } from "resend";

const DEFAULT_FROM = "onboarding@resend.dev";

export function emailFromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
}

export function appBaseUrl(): string {
  const fromEnv = process.env.FOLLOW_APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function unsubscribeUrl(token: string): string {
  return `${appBaseUrl()}/api/follow/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function sendFollowEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ id: string | null; skipped?: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn("[follow] RESEND_API_KEY not set — skipping email send", {
      to: opts.to,
      subject: opts.subject,
    });
    return { id: null, skipped: true };
  }

  try {
    const resend = new Resend(key);
    const result = await resend.emails.send({
      from: emailFromAddress(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (result.error) {
      console.error("[follow] Resend error", result.error);
      return { id: null, error: result.error.message };
    }
    return { id: result.data?.id ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "send failed";
    console.error("[follow] send failed", message);
    return { id: null, error: message };
  }
}
