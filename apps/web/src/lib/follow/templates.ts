import { appBaseUrl, unsubscribeUrl } from "./email";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(body: string, unsubToken: string): string {
  const unsub = unsubscribeUrl(unsubToken);
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f6f4ef;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6560;">Nigerians · Africa</p>
    ${body}
    <hr style="border:none;border-top:1px solid #ddd6cc;margin:28px 0 16px;" />
    <p style="margin:0;font-size:12px;line-height:1.5;color:#6b6560;">
      You opted in to follow updates on this record.
      <a href="${escapeHtml(unsub)}" style="color:#1a5c3a;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

export function ackFollowHtml(opts: {
  entityTitle: string;
  entityHref: string;
  cadence: "instant" | "weekly";
  unsubToken: string;
}): string {
  const cadenceLabel =
    opts.cadence === "instant" ? "as they happen" : "in a weekly digest";
  const link = `${appBaseUrl()}${opts.entityHref}`;
  return layout(
    `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:normal;line-height:1.25;">You're following this record</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
      We'll email you about <strong>${escapeHtml(opts.entityTitle)}</strong> ${cadenceLabel}.
    </p>
    <p style="margin:0;">
      <a href="${escapeHtml(link)}" style="color:#1a5c3a;">Open record →</a>
    </p>
    `,
    opts.unsubToken,
  );
}

export function instantEventHtml(opts: {
  entityTitle: string;
  entityHref: string;
  eventTitle: string;
  eventSummary: string;
  unsubToken: string;
}): string {
  const link = `${appBaseUrl()}${opts.entityHref}`;
  return layout(
    `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:normal;line-height:1.25;">${escapeHtml(opts.eventTitle)}</h1>
    <p style="margin:0 0 8px;font-size:13px;color:#6b6560;">Update on ${escapeHtml(opts.entityTitle)}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${escapeHtml(opts.eventSummary)}</p>
    <p style="margin:0;">
      <a href="${escapeHtml(link)}" style="color:#1a5c3a;">View on Nigerians · Africa →</a>
    </p>
    `,
    opts.unsubToken,
  );
}

export type DigestGroup = {
  entityTitle: string;
  entityHref: string;
  events: { title: string; summary: string }[];
};

export function weeklyDigestHtml(opts: {
  groups: DigestGroup[];
  unsubToken: string;
}): string {
  const sections = opts.groups
    .map((g) => {
      const link = `${appBaseUrl()}${g.entityHref}`;
      const items = g.events
        .map(
          (e) =>
            `<li style="margin:0 0 10px;"><strong>${escapeHtml(e.title)}</strong><br/><span style="color:#444;">${escapeHtml(e.summary)}</span></li>`,
        )
        .join("");
      return `
        <div style="margin:0 0 24px;">
          <h2 style="margin:0 0 8px;font-size:18px;font-weight:normal;">
            <a href="${escapeHtml(link)}" style="color:#1a1a1a;text-decoration:none;">${escapeHtml(g.entityTitle)}</a>
          </h2>
          <ul style="margin:0;padding-left:18px;">${items}</ul>
        </div>`;
    })
    .join("");

  return layout(
    `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:normal;">Your weekly follow digest</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#444;">Updates from the last 7 days on records you follow.</p>
    ${sections || `<p style="color:#6b6560;">No new updates this week.</p>`}
    `,
    opts.unsubToken,
  );
}
