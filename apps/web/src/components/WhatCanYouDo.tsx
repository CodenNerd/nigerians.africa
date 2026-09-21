import Link from "next/link";
import { FollowUpdatesPanel } from "./FollowUpdatesPanel";
import type { FollowableEntityType } from "@/lib/follow/types";

const defaults = [
  { label: "Report something", href: "/report" },
  { label: "Find who is responsible", href: "/government" },
  { label: "Learn your rights", href: "/guidance" },
  { label: "Submit evidence", href: "/report" },
  { label: "Support an organization", href: "/organizations" },
];

export type SidebarAction = {
  label: string;
  href: string;
};

export function WhatCanYouDo({
  actions,
  follow,
}: {
  actions?: SidebarAction[];
  /** When set, replaces dead “Follow …” links with the email follow panel. */
  follow?: {
    entityType: FollowableEntityType;
    entityId: string;
    entityTitle?: string;
  };
}) {
  const list = (actions?.length ? actions : defaults).filter((a) => {
    if (!follow) return true;
    const label = a.label.trim().toLowerCase();
    return label !== "follow" && !label.startsWith("follow this");
  });

  return (
    <div className="space-y-4">
      {follow ? (
        <FollowUpdatesPanel
          entityType={follow.entityType}
          entityId={follow.entityId}
          entityTitle={follow.entityTitle}
        />
      ) : null}
      <div className="bg-civic-greenSoft p-5">
        <h3 className="font-display text-lg tracking-tight text-ink">What can you do?</h3>
        <ul className="mt-4 grid gap-px bg-paper-border/60">
          {list.map((a) => (
            <li key={a.href + a.label}>
              <Link
                href={a.href}
                className="plane-link block bg-paper/70 px-3 py-2.5 text-sm text-ink no-underline hover:bg-paper"
              >
                {a.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
