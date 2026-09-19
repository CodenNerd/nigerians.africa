import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection, RelatedLinks } from "@/components/RecordPage";
import { StatusLabel } from "@/components/StatusLabel";

export function generateStaticParams() {
  return store.allPoliticalCandidates().map((c) => ({ slug: c.slug }));
}

export default async function CandidatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const candidacy = store.candidacyBySlug(slug);
  if (!candidacy) notFound();

  const person = store.allPeople().find((p) => p.id === candidacy.personId);
  const election = store.events().find((e) => e.id === candidacy.electionId);
  const office = candidacy.officeId
    ? store.allOffices().find((o) => o.id === candidacy.officeId)
    : undefined;
  const location = candidacy.locationId
    ? store.locations().find((l) => l.id === candidacy.locationId)
    : undefined;

  const relatedResults = store
    .electionResults(candidacy.electionId)
    .filter((r) => r.candidateId === candidacy.id);

  const related = [
    ...(person
      ? [{ href: `/people/${person.slug}`, label: person.fullName, hint: "Person profile" }]
      : []),
    ...(election
      ? [
          {
            href: `/events/elections/${election.slug}`,
            label: election.title,
            hint: "Election record",
          },
        ]
      : []),
    ...(office
      ? [
          {
            href: `/government/offices/${office.slug}`,
            label: office.title,
            hint: "Office sought",
          },
        ]
      : []),
    { href: "/candidates", label: "All candidacies", hint: "Archive list" },
  ];

  return (
    <RecordPage
      eyebrow="Candidacy"
      title={candidacy.ballotName ?? person?.fullName ?? candidacy.slug}
      subtitle={`${candidacy.party} · ${candidacy.status.replace(/_/g, " ")}`}
      askContext={`Candidacy: ${candidacy.ballotName ?? candidacy.slug}`}
      actions={[
        ...(person ? [{ label: "Open person", href: `/people/${person.slug}` }] : []),
        ...(election
          ? [{ label: "Open election", href: `/events/elections/${election.slug}` }]
          : []),
        { label: "All candidacies", href: "/candidates" },
      ]}
    >
      <RecordSection title="Status">
        <div className="flex flex-wrap items-center gap-2">
          <StatusLabel status={candidacy.verificationStatus} />
          <span className="text-xs uppercase tracking-wider text-ink-faint">
            {candidacy.status.replace(/_/g, " ")}
          </span>
        </div>
        {candidacy.manifestoSummary ? (
          <p className="mt-4 prose-record">{candidacy.manifestoSummary}</p>
        ) : (
          <p className="mt-4 text-ink-muted">No manifesto summary on record yet.</p>
        )}
      </RecordSection>

      <RecordSection title="Record details">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              Party
            </dt>
            <dd className="mt-1 text-ink">{candidacy.party}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              Ballot name
            </dt>
            <dd className="mt-1 text-ink">{candidacy.ballotName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              Office sought
            </dt>
            <dd className="mt-1 text-ink">{office?.title ?? "Not yet recorded"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              Scope
            </dt>
            <dd className="mt-1 text-ink">{location?.name ?? "—"}</dd>
          </div>
        </dl>
      </RecordSection>

      {relatedResults.length > 0 ? (
        <RecordSection title="Linked polling-unit results">
          <p className="mb-4 text-sm text-ink-muted">
            Demo tallies that point at this candidacy via candidateId.
          </p>
          <ul className="grid gap-px bg-paper-border">
            {relatedResults.map((r) => {
              const pu = store.locations().find((l) => l.id === r.pollingUnitId);
              return (
                <li key={r.id} className="bg-civic-amberSoft px-5 py-4">
                  <div className="font-medium text-ink">
                    {pu?.name ?? r.pollingUnitId}
                  </div>
                  <p className="mt-1 font-mono text-sm text-ink-muted">
                    Official {r.officialVotes ?? "—"} · Observer {r.observerVotes ?? "—"} ·{" "}
                    {r.party}
                  </p>
                </li>
              );
            })}
          </ul>
        </RecordSection>
      ) : null}

      <RecordSection title="Related">
        <RelatedLinks items={related} />
      </RecordSection>
    </RecordPage>
  );
}
