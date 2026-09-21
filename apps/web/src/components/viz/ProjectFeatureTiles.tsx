import Image from "next/image";
import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import type { Evidence, Project, ProjectHandlerKind } from "@nigeria-for-nigerians/domain";
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

type MediaTile = {
  id: string;
  href: string;
  src: string;
  kind: "image" | "video";
  title: string;
};

function mediaTilesForProject(project: Project): MediaTile[] {
  const rows: Evidence[] = [
    ...store.evidenceFor("project", project.id),
    ...(project.problemId ? store.evidenceFor("problem", project.problemId) : []),
  ];
  const seen = new Set<string>();
  const tiles: MediaTile[] = [];

  for (const e of rows) {
    if (seen.has(e.id)) continue;
    if (!e.mediaUrl || (e.mediaKind !== "image" && e.mediaKind !== "video")) continue;
    seen.add(e.id);
    const isVideo = e.mediaKind === "video";
    const src = isVideo ? e.posterUrl || e.mediaUrl : e.mediaUrl;
    if (!src) continue;
    tiles.push({
      id: e.id,
      href: `/evidence/${e.id}`,
      src,
      kind: isVideo ? "video" : "image",
      title: e.title,
    });
  }

  if (!tiles.length && project.coverUrl) {
    tiles.push({
      id: `cover-${project.id}`,
      href: `/projects/${project.slug}`,
      src: project.coverUrl,
      kind: "image",
      title: `${project.name} cover`,
    });
  }

  return tiles.slice(0, 5);
}

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
          const media = mediaTilesForProject(p);

          return (
            <li key={p.id} className={`relative flex h-full flex-col ${plane}`}>
              <span className="absolute left-0 top-0 z-10 h-full w-1 bg-civic-green opacity-70" />
              <Link
                href={`/projects/${p.slug}`}
                className="plane-link group flex flex-1 flex-col p-5 no-underline sm:p-6"
              >
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

                <div className="mt-5 flex flex-1 flex-wrap items-end justify-between gap-3 pl-3">
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

              {media.length > 0 ? (
                <div className="border-t border-paper-border pl-1">
                  <p className="px-5 pt-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint sm:px-6">
                    Evidence · {media.length} media
                  </p>
                  <ul className="mt-2 flex gap-px overflow-x-auto bg-paper-border">
                    {media.map((m) => (
                      <li key={m.id} className="min-w-0 shrink-0 basis-[30%] sm:basis-[28%]">
                        <Link
                          href={m.href}
                          className="plane-link relative block aspect-[4/3] overflow-hidden bg-ink/10 no-underline"
                          title={m.title}
                        >
                          <Image
                            src={m.src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="160px"
                          />
                          {m.kind === "video" ? (
                            <span className="absolute inset-0 flex items-center justify-center bg-ink/30">
                              <span className="border border-paper/80 bg-paper/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink">
                                Play
                              </span>
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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
