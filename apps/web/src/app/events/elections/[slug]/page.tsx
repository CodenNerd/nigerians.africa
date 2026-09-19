import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection, SourceList } from "@/components/RecordPage";
import { StatusLabel } from "@/components/StatusLabel";

export function generateStaticParams() {
  return store
    .events()
    .filter((e) => e.type === "election")
    .map((e) => ({ slug: e.slug }));
}

export default async function ElectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = store.eventBySlug(slug);
  if (!event || event.type !== "election") notFound();

  const isUpcoming = event.status === "upcoming";
  const results = store.electionResults(event.id);
  const discrepancies = store.discrepancies(event.id);
  const candidacies = store.candidaciesForElection(event.id);

  const puIds = [...new Set(results.map((r) => r.pollingUnitId))];
  const pollingUnits = puIds
    .map((id) => store.locations().find((l) => l.id === id))
    .filter(Boolean);

  const sources = [
    store.sourceById("src-inec-official"),
    store.sourceById("src-inece-observer"),
  ]
    .filter(Boolean)
    .map((s) => ({ id: s!.id, title: s!.title, publisher: s!.publisher, date: s!.publicationDate }));

  return (
    <RecordPage
      eyebrow="Election"
      title={event.title}
      subtitle={event.summary}
      askContext={event.title}
      actions={
        isUpcoming
          ? [
              { label: "Follow this cycle", href: "/action" },
              { label: "Learn civic guidance", href: "/guidance" },
              ...(candidacies.length
                ? [{ label: "Browse candidacies", href: "/candidates" }]
                : []),
            ]
          : [
              {
                label: "Submit observation",
                href: `/report?election=${event.slug}`,
              },
              { label: "View evidence", href: "/evidence/ev-pu-official" },
              ...(candidacies.length
                ? [{ label: "Browse candidacies", href: "/candidates" }]
                : []),
            ]
      }
    >
      <RecordSection title="Status">
        <p className="text-sm uppercase tracking-wider text-ink-faint">{event.status}</p>
        <p className="mt-2 prose-record">
          {isUpcoming
            ? "This cycle is recorded before results exist. Official results, polling-unit pages and observer tallies will attach when the election opens."
            : "Archived or completed election record in the public graph. Open a polling unit to compare official vs observer counts."}
        </p>
        {isUpcoming ? (
          <p className="mt-4 text-sm">
            Related personality:{" "}
            <Link href="/people/bola-ahmed-tinubu" className="text-civic-green hover:underline">
              Bola Ahmed Tinubu
            </Link>
          </p>
        ) : null}
      </RecordSection>

      {candidacies.length > 0 ? (
        <RecordSection title="Candidacies on record">
          <p className="mb-4 text-sm text-ink-muted">
            {candidacies.length} candidac{candidacies.length === 1 ? "y" : "ies"} linked to this
            election. Full archive at{" "}
            <Link href="/candidates" className="text-civic-green hover:underline">
              /candidates
            </Link>
            .
          </p>
          <ul className="grid gap-px bg-paper-border">
            {candidacies.map((c) => {
              const person = store.allPeople().find((p) => p.id === c.personId);
              const office = c.officeId
                ? store.allOffices().find((o) => o.id === c.officeId)
                : undefined;
              return (
                <li key={c.id}>
                  <Link
                    href={`/candidates/${c.slug}`}
                    className="plane-link block bg-civic-blueSoft px-5 py-4 no-underline"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-display text-lg text-ink">
                        {c.ballotName ?? person?.fullName ?? "Candidacy"}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      {c.party}
                      {office ? ` · ${office.title}` : null}
                      {person ? (
                        <>
                          {" · "}
                          <span className="text-civic-green">{person.fullName}</span>
                        </>
                      ) : null}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </RecordSection>
      ) : null}

      <RecordSection title="Principle">
        <p className="prose-record">
          The system surfaces discrepancies and preserves evidence. It does{" "}
          <strong>not</strong> automatically declare electoral fraud or wrongdoing.
        </p>
      </RecordSection>

      {isUpcoming ? (
        <RecordSection title="What will appear here">
          <ul className="list-disc space-y-2 pl-5 text-ink-muted">
            <li>Constituencies and polling units</li>
            <li>Official results (e.g. INEC forms)</li>
            <li>Citizen and observer submissions with evidence</li>
            <li>Surfaced discrepancies for investigation — not automated verdicts</li>
          </ul>
        </RecordSection>
      ) : (
        <>
          <RecordSection title="Polling units">
            <p className="mb-4 text-sm text-ink-muted">
              {pollingUnits.length} units with correlated official and observer tallies in this demo.
            </p>
            <ul className="grid gap-px bg-paper-border">
              {pollingUnits.map((pu) => {
                const puResults = results.filter((r) => r.pollingUnitId === pu!.id);
                const puDisc = discrepancies.filter((d) => d.pollingUnitId === pu!.id);
                const observerCount = puResults.filter((r) => r.observerVotes != null).length;
                return (
                  <li key={pu!.id}>
                    <Link
                      href={`/events/elections/${event.slug}/polling-units/${pu!.slug}`}
                      className="plane-link block bg-civic-amberSoft p-5 no-underline"
                    >
                      <div className="font-display text-xl text-ink">{pu!.name}</div>
                      <p className="mt-2 text-sm text-ink-muted">
                        {puResults.length} candidate rows · {observerCount} observer tallies
                        {puDisc.length
                          ? ` · ${puDisc.length} surfaced discrepanc${puDisc.length === 1 ? "y" : "ies"}`
                          : " · no discrepancy surfaced"}
                      </p>
                      <span className="mt-3 inline-block font-mono text-[11px] uppercase tracking-wider text-civic-amber">
                        Open unit →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </RecordSection>

          <RecordSection title="All official vs observer rows">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-paper-border text-left text-xs uppercase tracking-wider text-ink-faint">
                    <th className="py-2 pr-4">PU</th>
                    <th className="py-2 pr-4">Candidate</th>
                    <th className="py-2 pr-4">Party</th>
                    <th className="py-2 pr-4">Official</th>
                    <th className="py-2 pr-4">Observer</th>
                    <th className="py-2">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const pu = store.locations().find((l) => l.id === r.pollingUnitId);
                    const delta = (r.officialVotes ?? 0) - (r.observerVotes ?? 0);
                    const candidacy = r.candidateId
                      ? store.allPoliticalCandidates().find((c) => c.id === r.candidateId)
                      : undefined;
                    return (
                      <tr key={r.id} className="border-b border-paper-border">
                        <td className="py-3 pr-4">
                          {pu ? (
                            <Link
                              href={`/events/elections/${event.slug}/polling-units/${pu.slug}`}
                              className="text-civic-green hover:underline"
                            >
                              {pu.name.replace(/^Polling Unit /, "PU ")}
                            </Link>
                          ) : (
                            r.pollingUnitId
                          )}
                        </td>
                        <td className="py-3 pr-4 font-medium">
                          {candidacy ? (
                            <Link
                              href={`/candidates/${candidacy.slug}`}
                              className="text-civic-green hover:underline"
                            >
                              {r.candidate}
                            </Link>
                          ) : (
                            r.candidate
                          )}
                        </td>
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

          <RecordSection title="Surfaced discrepancies">
            {discrepancies.length === 0 ? (
              <p className="text-ink-muted">No discrepancies surfaced for this election.</p>
            ) : (
              discrepancies.map((d) => {
                const pu = store.locations().find((l) => l.id === d.pollingUnitId);
                return (
                  <div key={d.id} className="mb-3 border border-civic-amber bg-civic-amberSoft px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusLabel status="disputed" />
                      <span className="text-xs uppercase tracking-wider text-ink-faint">{d.status}</span>
                    </div>
                    {pu ? (
                      <Link
                        href={`/events/elections/${event.slug}/polling-units/${pu.slug}`}
                        className="mt-2 inline-block text-sm text-civic-green hover:underline"
                      >
                        {pu.name}
                      </Link>
                    ) : null}
                    <p className="mt-3 text-ink">{d.description}</p>
                    <p className="mt-2 text-sm text-ink-muted">{d.note}</p>
                    <p className="mt-2 font-mono text-sm">
                      Official {d.officialTotal} · Observer {d.observerTotal} · Difference{" "}
                      {d.difference}
                    </p>
                  </div>
                );
              })
            )}
          </RecordSection>

          <RecordSection title="Sources">
            <SourceList items={sources} />
          </RecordSection>
        </>
      )}
    </RecordPage>
  );
}
