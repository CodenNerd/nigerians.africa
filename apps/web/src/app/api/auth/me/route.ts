import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const jar = await cookies();
  const session = jar.get("na_session")?.value ?? null;
  return NextResponse.json({ session });
}
