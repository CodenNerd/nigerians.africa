import Image from "next/image";
import Link from "next/link";
import type { Evidence, Organization, ProsecutionMatter } from "@nigeria-for-nigerians/domain";
import {
  MATTER_PROGRESS_STEPS,
  matterProgressIndex,
} from "@nigeria-for-nigerians/domain";
import { VizFrame } from "./VizFrame";

export type MatterReelItem = {
  matter: ProsecutionMatter;
  locationName?: string;
  org?: Organization;
  evidence?: Evidence;
  /** Image/video evidence for tile strips on list cards. */
  media?: Evidence[];
  href: string;
};

export function MatterReel({
  items,
  emptyHint = "No matters published yet.",
}: {
  items: MatterReelItem[];
  emptyHint?: string;
}) {
  if (!items.length) {
    return <p className="text-sm text-ink-muted">{emptyHint}</p>;
  }

  return (
    <VizFrame eyebrow="On the record" title="Matters in motion" meta={`${items.length} in reel`}>
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <ul className="flex snap-x snap-mandatory gap-px bg-paper-border">
          {items.map((item) => {
            const { matter, locationName, org, evidence, href } = item;
            const progress = matterProgressIndex(matter.status);
            const pct = Math.round((progress / (MATTER_PROGRESS_STEPS - 1)) * 100);
            const poster = evidence?.posterUrl;
            const isVideo = evidence?.mediaKind === "video";

            return (
              <li
                key={matter.id}
                className="w-[16.5rem] shrink-0 snap-start bg-paper-card sm:w-[18rem]"
              >
                <Link href={href} className="plane-link group block h-full no-underline">
                  <div className="relative aspect-[4/5] overflow-hidden bg-ink/10">
                    {poster ? (
                      <Image
                        src={poster}
                        alt=""
                        fill
                        className="object-cover transition duration-300 group-hover:brightness-[0.97]"
                        sizes="288px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-civic-slate to-ink" />
                    )}
                    {isVideo ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-ink/20">
                        <span className="border border-paper bg-paper/90 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink">
                          Play
                        </span>
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-3 px-3 py-3 sm:px-4 sm:py-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                        {matter.category.replace(/_/g, " ")}
                        {locationName ? ` · ${locationName}` : ""}
                      </p>
                      <p className="mt-1 font-display text-lg leading-snug text-ink group-hover:text-civic-green">
                        {matter.title}
                      </p>
                    </div>

                    <p className="text-sm text-ink-muted">
                      {org ? (
                        <>
                          <span className="text-[10px] uppercase tracking-wider text-ink-faint">
                            Handling ·{" "}
                          </span>
                          <span className="text-civic-green">{org.name}</span>
                        </>
                      ) : (
                        <span className="text-civic-amber">Awaiting NGO</span>
                      )}
                    </p>

                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                          Progress
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                          {matter.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full bg-ink/10" aria-hidden>
                        <div
                          className="meter-fill h-full bg-civic-green"
                          style={{ width: `${Math.max(8, pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </VizFrame>
  );
}
