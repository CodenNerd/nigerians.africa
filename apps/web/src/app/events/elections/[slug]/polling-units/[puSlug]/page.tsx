import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection } from "@/components/RecordPage";
import { StatusLabel } from "@/components/StatusLabel";

export function generateStaticParams() {
  const elections = store.events().filter((e) => e.type === "election");
  const params: { slug: string; puSlug: string }[] = [];
  for (const e of elections) {
    const puIds = [...new Set(store.electionResults(e.id).map((r) => r.pollingUnitId))];
    for (const id of puIds) {
      const loc = store.locations().find((l) => l.id === id);
      if (loc) params.push({ slug: e.slug, puSlug: loc.slug });
    }
  }
  return params;
}

export default async function PollingUnitPage({
  params,
}: {
  params: Promise<{ slug: string; puSlug: string }>;
}) {
  const { slug, puSlug } = await params;
  const event = store.eventBySlug(slug);
  if (!event || event.type !== "election") notFound();

  const pu = store.locations().find((l) => l.slug === puSlug && l.type === "polling_unit");
  if (!pu) notFound();

  const results = store.electionResults(event.id).filter((r) => r.pollingUnitId === pu.id);
  if (results.length === 0) notFound();

  const discrepancies = store.discrepancies(event.id).filter((d) => d.pollingUnitId === pu.id);
  const ward = pu.parentId ? store.locations().find((l) => l.id === pu.parentId) : undefined;

  const evidenceIds = [
    ...new Set(
      results.flatMap((r) => [r.sourceOfficialId, r.sourceObserverId].filter(Boolean) as string[]),
    ),
  ];

  return (
    <RecordPage
      eyebrow={`Election · Polling unit`}
      title={pu.name}
      subtitle={`${event.title} — official vs observer correlation`}
      askContext={`${pu.name} ${event.title}`}
      actions={[
        {
          label: "Submit your count",
          href: `/report?election=${event.slug}&pu=${pu.slug}`,
        },
        {
          label: "Back to election",
          href: `/events/elections/${event.slug}`,
        },
      ]}
    >
      <RecordSection title="Location">
        <p className="prose-record">{pu.summary}</p>
        {ward ? (
          <p className="mt-2 text-sm">
            Ward:{" "}
            <Link href={`/places/wards/${ward.slug}`} className="text-civic-green hover:underline">
              {ward.name}
            </Link>
          </p>
        ) : null}
      </RecordSection>

      <RecordSection title="Official vs observer">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-paper-border text-left text-xs uppercase tracking-wider text-ink-faint">
                <th className="py-2 pr-4">Candidate</th>
                <th className="py-2 pr-4">Party</th>
                <th className="py-2 pr-4">Official</th>
                <th className="py-2 pr-4">Observer</th>
                <th className="py-2">Δ</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const delta = (r.officialVotes ?? 0) - (r.observerVotes ?? 0);
                return (
                  <tr key={r.id} className="border-b border-paper-border">
                    <td className="py-3 pr-4 font-medium">{r.candidate}</td>
                    <td className="py-3 pr-4 text-ink-muted">{r.party}</td>
                    <td className="py-3 pr-4 font-mono">{r.officialVotes}</td>
                    <td className="py-3 pr-4 font-mono">{r.observerVotes}</td>
                    <td
                      className={`py-3 font-mono ${delta !== 0 ? "text-civic-red" : "text-ink-faint"}`}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </RecordSection>

      <RecordSection title="Discrepancy">
        {discrepancies.length === 0 ? (
          <p className="text-ink-muted">
            No discrepancy surfaced for this unit. Observer and official totals align within this
            demo seed — still submit your count if you observed differently.
          </p>
        ) : (
          discrepancies.map((d) => (
            <div key={d.id} className="border border-civic-amber bg-civic-amberSoft px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusLabel status="disputed" />
                <span className="text-xs uppercase tracking-wider text-ink-faint">{d.status}</span>
              </div>
              <p className="mt-3 text-ink">{d.description}</p>
              <p className="mt-2 text-sm text-ink-muted">{d.note}</p>
              <p className="mt-2 font-mono text-sm">
                Official {d.officialTotal} · Observer {d.observerTotal} · Difference {d.difference}
              </p>
            </div>
          ))
        )}
      </RecordSection>

      <RecordSection title="Evidence">
        <ul className="space-y-2">
          {evidenceIds.map((id) => {
            const ev = store.evidenceById(id);
            if (!ev) return null;
            return (
              <li key={id}>
                <Link href={`/evidence/${ev.slug}`} className="hover:underline">
                  {ev.title}
                </Link>
                <span className="ml-2 text-xs text-ink-faint">{ev.verificationStatus}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-ink-muted">
          Multiple citizens can declare counts with evidence. Correlation is visible; the product
          does not auto-declare fraud.
        </p>
      </RecordSection>
    </RecordPage>
  );
}
