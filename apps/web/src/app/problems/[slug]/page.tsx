import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import {
  MoneyFigure,
  RecordPage,
  RecordSection,
  RelatedLinks,
  SourceList,
  Timeline,
} from "@/components/RecordPage";
import { FollowTheThread } from "@/components/FollowTheThread";
import { StatusLabel } from "@/components/StatusLabel";
import { PlacesMap } from "@/components/PlacesMap";

export function generateStaticParams() {
  return store.allProblems().map((p) => ({ slug: p.slug }));
}

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = store.problemBySlug(slug);
  if (!problem) notFound();

  const locations = problem.locationIds
    .map((id) => store.locations().find((l) => l.id === id))
    .filter(Boolean);
  const offices = problem.officeIds
    .map((id) => store.allOffices().find((o) => o.id === id))
    .filter(Boolean);
  const projects = store.allProjects().filter((p) => p.problemId === problem.id);
  const reports = store.reports().filter((r) => r.problemId === problem.id);
  const evidence = store.evidenceFor("problem", problem.id);
  const related = store.related("problem", problem.id);
  const sources = evidence
    .map((e) => store.sourceById(e.sourceId))
    .filter(Boolean)
    .map((s) => ({ id: s!.id, title: s!.title, publisher: s!.publisher, date: s!.publicationDate }));

  return (
    <RecordPage
      eyebrow="Problem"
      title={problem.title}
      subtitle={problem.description}
      status={problem.verificationStatus}
      meta={
        <span className="text-sm text-ink-faint">
          {problem.category} · Severity {problem.severity} · First reported {problem.firstReportedAt}
        </span>
      }
      askContext={problem.title}
      actions={[
        { label: "Report an update", href: "/report" },
        { label: "See responsible offices", href: "/government" },
        { label: "Follow this problem", href: "/action" },
      ]}
    >
      <RecordSection title="What is happening">
        <p className="prose-record">{problem.description}</p>
        <p className="mt-3 text-sm text-ink-faint">Status in registry: {problem.status}</p>
      </RecordSection>

      <RecordSection title="Where">
        <PlacesMap
          points={locations.map((l) => ({
            id: l!.id,
            name: l!.name,
            lat: l!.lat,
            lng: l!.lng,
            href: `/places`,
            kind: l!.type,
          }))}
          center={locations[0] ? [locations[0]!.lat, locations[0]!.lng] : undefined}
        />
        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          {locations.map((l) => (
            <li key={l!.id} className="border border-paper-border px-2 py-1">
              {l!.name} ({l!.type})
            </li>
          ))}
        </ul>
      </RecordSection>

      <RecordSection title="Who is responsible">
        <RelatedLinks
          items={offices.map((o) => ({
            href: `/government/offices/${o!.slug}`,
            label: o!.name,
            hint: o!.mandate,
          }))}
        />
      </RecordSection>

      <RecordSection title="What is being done">
        <RelatedLinks
          items={projects.map((p) => ({
            href: `/projects/${p.slug}`,
            label: p.name,
            hint: `Status: ${p.status.replace(/_/g, " ")}`,
          }))}
        />
      </RecordSection>

      <RecordSection title="Money">
        <div className="grid gap-3 sm:grid-cols-3">
          {projects.map((p) => (
            <MoneyFigure
              key={p.id}
              label={p.name}
              value={`${store.formatNaira(p.approvedAmount)} approved`}
            />
          ))}
        </div>
      </RecordSection>

      <RecordSection title="Evidence">
        <ul className="space-y-3">
          {evidence.length === 0 ? (
            <li className="text-ink-muted">No evidence linked directly yet — see related projects.</li>
          ) : (
            evidence.map((e) => (
              <li key={e.id} className="border border-paper-border bg-paper-card px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <a href={`/evidence/${e.id}`} className="font-medium text-ink hover:underline">
                    {e.title}
                  </a>
                  <StatusLabel status={e.verificationStatus} />
                </div>
                <p className="mt-1 text-sm text-ink-muted">{e.description}</p>
              </li>
            ))
          )}
        </ul>
      </RecordSection>

      <RecordSection title="Citizen reports">
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="border border-paper-border px-4 py-3">
              <div className="font-medium">{r.title}</div>
              <p className="mt-1 text-sm text-ink-muted">{r.description}</p>
              <div className="mt-2 text-xs text-ink-faint">
                {r.submittedAt} · {r.status}
              </div>
            </li>
          ))}
        </ul>
      </RecordSection>

      <RecordSection title="History">
        <Timeline
          items={[
            { date: problem.firstReportedAt, title: "First reported in registry" },
            ...reports.map((r) => ({
              date: r.submittedAt.slice(0, 10),
              title: r.title,
              description: r.description.slice(0, 120),
            })),
          ]}
        />
      </RecordSection>

      <FollowTheThread nodes={related.length ? related : store.signatureThread()} />

      <RecordSection title="Sources">
        <SourceList items={sources} />
      </RecordSection>
    </RecordPage>
  );
}
