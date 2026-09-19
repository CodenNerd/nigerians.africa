import Link from "next/link";

const defaults = [
  { label: "Report something", href: "/report" },
  { label: "Find who is responsible", href: "/government" },
  { label: "Learn your rights", href: "/guidance" },
  { label: "Submit evidence", href: "/report" },
  { label: "Support an organization", href: "/organizations" },
];

export function WhatCanYouDo({
  actions,
}: {
  actions?: { label: string; href: string }[];
}) {
  const list = actions?.length ? actions : defaults;
  return (
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
  );
}
