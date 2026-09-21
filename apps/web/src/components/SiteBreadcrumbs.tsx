import Link from "next/link";
import { headers } from "next/headers";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

export async function SiteBreadcrumbs() {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "/";
  const crumbs = buildBreadcrumbs(pathname);
  if (!crumbs?.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-paper-border bg-paper/80"
    >
      <div className="site-container py-2.5">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] leading-snug text-ink-faint">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-x-1.5">
                {i > 0 ? (
                  <span className="font-mono text-ink-faint/70" aria-hidden>
                    /
                  </span>
                ) : null}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="text-ink-muted no-underline transition hover:text-civic-green"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "font-medium text-ink" : "text-ink-muted"}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
