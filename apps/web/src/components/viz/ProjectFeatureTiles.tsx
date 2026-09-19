import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import type { Project, ProjectHandlerKind } from "@nigeria-for-nigerians/domain";
import { StatusLabel } from "@/components/StatusLabel";
import { SectionHead } from "@/components/ui";

const handlerTone: Record<
  ProjectHandlerKind,
  { plane: string; ink: string; label: string }
> = {
  government: { plane: "bg-civic-blueSoft", ink: "text-civic-blue", label: "Government" },
  business: { plane: "bg-civic-amberSoft", ink: "text-civic-amber", label: "Business" },
  ngo: { plane: "bg-civic-greenSoft", ink: "text-civic-green", label: "NGO" },
  community: { plane: "bg-paper", ink: "text-civic-slate", label: "Community" },
};

const tilePlane = ["bg-civic-greenSoft", "bg-civic-blueSoft", "bg-civic-amberSoft", "bg-civic-redSoft"];

export function ProjectFeatureTiles({
  projects,
  title = "Featured projects",
  subtitle = "Who is handling the work — government, business, NGOs and community actors.",
}: {
  projects?: Project[];
  title?: string;
  subtitle?: string;
}) {
  const list = projects ?? store.featuredProjects();

  return (
    <div>
      <SectionHead title={title} subtitle={subtitle} meta={`${list.length} featured`} />
      <ul className="mt-6 grid gap-px bg-paper-border sm:grid-cols-2">
        {list.map((p, i) => {
          const handlers = store.projectHandlers(p.id);
          const loc = store.locations().find((l) => l.id === p.locationId);
          const releasedPct =
            p.approvedAmount > 0 ? Math.round((p.releasedAmount / p.approvedAmount) * 100) : 0;
          const plane = tilePlane[i % tilePlane.length];

          return (
            <li key={p.id}>
              <Link
                href={`/projects/${p.slug}`}
                className={`plane-link group relative block h-full ${plane} p-5 no-underline sm:p-6`}
              >
                <span className="absolute left-0 top-0 h-full w-1 bg-civic-green opacity-70" />
                <div className="flex flex-wrap items-center justify-between gap-2 pl-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">
                    Project · {p.status.replace(/_/g, " ")}
                  </span>
                  <StatusLabel status={p.verificationStatus} />
                </div>
                <h3 className="mt-3 pl-3 font-display text-2xl leading-snug text-ink sm:text-3xl">
                  {p.name}
                </h3>
                <p className="mt-2 line-clamp-2 pl-3 text-sm text-ink-muted">{p.description}</p>

                <div className="mt-4 flex flex-wrap gap-1.5 pl-3">
                  {handlers.length === 0 ? (
                    <span className="border border-paper-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-faint">
                      Handler not linked
                    </span>
                  ) : (
                    handlers.map((h) => {
                      const t = handlerTone[h.kind];
                      return (
                        <span
                          key={h.kind + h.href}
                          className={`inline-flex items-center gap-1.5 border border-transparent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${t.plane} ${t.ink}`}
                          title={h.label}
                        >
                          {t.label}
                          <span className="font-normal normal-case tracking-normal opacity-80">
                            · {h.label.length > 28 ? h.label.slice(0, 28) + "…" : h.label}
                          </span>
                        </span>
                      );
                    })
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-3 pl-3">
                  <div>
                    <p className="font-mono text-[11px] text-ink-faint">
                      {loc?.name ?? "Location"} · {store.formatNaira(p.releasedAmount)} released
                    </p>
                    <div className="mt-1.5 h-1.5 w-36 bg-ink/10" aria-hidden>
                      <div
                        className="h-full bg-civic-green"
                        style={{ width: `${Math.min(100, Math.max(4, releasedPct))}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-civic-green opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-4">
        <Link href="/projects" className="text-sm text-civic-green no-underline hover:underline">
          All projects →
        </Link>
      </p>
    </div>
  );
}
