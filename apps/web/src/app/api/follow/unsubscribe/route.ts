import { NextRequest, NextResponse } from "next/server";
import { deactivateFollowByToken } from "@/lib/follow";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")?.trim();
    if (!token) {
      return new NextResponse(pageHtml("Missing token", "This unsubscribe link is incomplete."), {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const row = await deactivateFollowByToken(token);
    if (!row) {
      return new NextResponse(pageHtml("Not found", "This follow subscription was not found."), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new NextResponse(
      pageHtml(
        "Unsubscribed",
        `You will no longer receive email updates about <strong>${escape(row.entityTitle)}</strong>. You can follow again anytime from the record page.`,
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  } catch (err) {
    console.error("[follow] unsubscribe failed", err);
    return new NextResponse(
      pageHtml("Error", "Could not process unsubscribe. Try again from /following."),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function pageHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escape(title)} · Nigerians · Africa</title>
  <style>
    body { margin:0; font-family: Georgia, 'Times New Roman', serif; background:#f6f4ef; color:#1a1a1a; }
    main { max-width: 32rem; margin: 4rem auto; padding: 0 1.25rem; }
    h1 { font-size: 1.75rem; font-weight: normal; margin: 0 0 0.75rem; }
    p { line-height: 1.55; color: #444; }
    a { color: #1a5c3a; }
  </style>
</head>
<body>
  <main>
    <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6560;">Nigerians · Africa</p>
    <h1>${escape(title)}</h1>
    <p>${body}</p>
    <p><a href="/">Back to home</a> · <a href="/following">Manage follows</a></p>
  </main>
</body>
</html>`;
}
