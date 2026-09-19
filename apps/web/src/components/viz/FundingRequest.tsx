import Link from "next/link";
import type { DonationCampaign } from "@nigeria-for-nigerians/domain";
import { store } from "@nigeria-for-nigerians/domain";

export function FundingRequest({ campaigns }: { campaigns: DonationCampaign[] }) {
  if (!campaigns.length) return null;

  return (
    <div className="space-y-px bg-paper-border">
      {campaigns.map((camp) => {
        const raisedPct =
          camp.goalAmount > 0
            ? Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100))
            : 0;
        const host = camp.organizationId
          ? store.allOrganizations().find((o) => o.id === camp.organizationId)
          : undefined;

        return (
          <div
            key={camp.id}
            className="relative border border-transparent bg-civic-blueSoft/60 px-4 py-5 sm:px-6 sm:py-6"
          >
            <span className="absolute left-0 top-0 h-full w-1 bg-civic-blue" aria-hidden />
            <div className="pl-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-civic-blue/30 bg-paper px-2 py-0.5 text-[10px] uppercase tracking-wider text-civic-blue">
                  {camp.platform}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-ink-faint">{camp.status}</span>
              </div>
              <h3 className="mt-2 font-display text-2xl leading-snug text-ink sm:text-3xl">
                {camp.title}
              </h3>
              {camp.appeal ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{camp.appeal}</p>
              ) : null}
              {host ? (
                <p className="mt-2 text-xs text-ink-faint">
                  Hosted by{" "}
                  <Link href={`/organizations/${host.slug}`} className="text-civic-green">
                    {host.name}
                  </Link>
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-[12rem] flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-mono text-sm text-ink">
                      {store.formatNaira(camp.raisedAmount)} raised
                    </span>
                    <span className="font-mono text-xs text-ink-faint">
                      of {store.formatNaira(camp.goalAmount)} · {raisedPct}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 w-full bg-ink/10" aria-hidden>
                    <div
                      className="meter-fill h-full bg-civic-blue"
                      style={{ width: `${raisedPct === 0 ? 0 : Math.max(4, raisedPct)}%` }}
                    />
                  </div>
                </div>
                <a
                  href={camp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border border-civic-blue bg-civic-blue px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-paper no-underline transition hover:brightness-110"
                >
                  Open on {camp.platform} (external)
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
