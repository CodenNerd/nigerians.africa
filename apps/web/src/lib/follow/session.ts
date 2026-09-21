import { cookies } from "next/headers";

/** Parse demo `na_session` cookie (`role:email`). */
export async function getSessionEmail(): Promise<string | null> {
  const jar = await cookies();
  const session = jar.get("na_session")?.value;
  if (!session) return null;
  const colon = session.indexOf(":");
  if (colon < 0) return null;
  const email = session.slice(colon + 1).trim().toLowerCase();
  return email.includes("@") ? email : null;
}

export async function getSessionRole(): Promise<string | null> {
  const jar = await cookies();
  const session = jar.get("na_session")?.value;
  if (!session) return null;
  return session.split(":")[0] || null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
