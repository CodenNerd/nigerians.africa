import { NextRequest, NextResponse } from "next/server";

const roles: Record<string, string> = {
  "citizen@demo.ng": "citizen",
  "verify@demo.ng": "verifier",
  "gov@demo.ng": "government",
  "admin@demo.ng": "admin",
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string; password?: string };
  const email = (body.email || "").toLowerCase().trim();
  if (!email || !body.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const role = roles[email] || "citizen";
  const session = `${role}:${email}`;

  const res = NextResponse.json({
    ok: true,
    role,
    email,
    redirect: role === "verifier" || role === "admin" ? "/admin" : "/action",
  });

  res.cookies.set("na_session", session, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("na_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
