import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection, RelatedLinks } from "@/components/RecordPage";

export function generateStaticParams() {
  return store.guidance().map((g) => ({ slug: g.slug }));
}

export default async function GuidanceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = store.guidanceBySlug(slug);
  if (!topic) notFound();

  const offices = topic.responsibleOfficeIds
    .map((id) => store.allOffices().find((o) => o.id === id))
    .filter(Boolean);
  const orgs = topic.organizationIds
    .map((id) => store.allOrganizations().find((o) => o.id === id))
    .filter(Boolean);

  return (
    <RecordPage
      eyebrow="Civic guidance"
      title={topic.title}
      subtitle={topic.situation}
      askContext={topic.title}
      contributions={{ entityType: "guidance", entityId: topic.id, entityTitle: topic.title }}
      actions={[
        { label: "Report this issue", href: "/report" },
        { label: "Ask for more help", href: "/ask" },
      ]}
    >
      <RecordSection title="Understand your rights / options">
        <ul className="list-disc space-y-2 pl-5 text-ink-muted">
          {topic.rights.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </RecordSection>

      <RecordSection title="Evidence to preserve">
        <ul className="list-disc space-y-2 pl-5 text-ink-muted">
          {topic.evidenceToKeep.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </RecordSection>

      <RecordSection title="Who may be responsible">
        <RelatedLinks
          items={offices.map((o) => ({
            href: `/government/offices/${o!.slug}`,
            label: o!.name,
            hint: o!.mandate,
          }))}
        />
        {!offices.length ? (
          <p className="text-sm text-ink-muted">
            Use Ask or browse Government if the responsible office is unclear.
          </p>
        ) : null}
      </RecordSection>

      <RecordSection title="Where to report">
        <ul className="list-disc space-y-2 pl-5 text-ink-muted">
          {topic.reportPaths.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </RecordSection>

      <RecordSection title="Organizations that may help">
        <RelatedLinks
          items={orgs.map((o) => ({
            href: `/organizations/${o!.slug}`,
            label: o!.name,
            hint: o!.mission,
          }))}
        />
      </RecordSection>

      <RecordSection title="Next steps">
        <ol className="list-decimal space-y-2 pl-5 text-ink-muted">
          {topic.nextSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-4">
          <Link href="/report" className="text-civic-green hover:underline">
            Take action — submit a report →
          </Link>
        </p>
      </RecordSection>
    </RecordPage>
  );
}
