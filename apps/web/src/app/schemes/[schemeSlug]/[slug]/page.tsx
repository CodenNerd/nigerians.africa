import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection, RelatedLinks } from "@/components/RecordPage";
import { StatusLabel } from "@/components/StatusLabel";
import { EvidenceMediaGallery } from "@/components/viz";

export function generateStaticParams() {
  return store.allProsecutionMatters().flatMap((m) => {
    const scheme = store.allCivicSchemes().find((s) => s.id === m.schemeId);
    if (!scheme) return [];
    return [{ schemeSlug: scheme.slug, slug: m.slug }];
  });
}

export default async function MatterPage({
  params,
}: {
  params: Promise<{ schemeSlug: string; slug: string }>;
}) {
  const { schemeSlug, slug } = await params;
  const scheme = store.schemeBySlug(schemeSlug);
  const matter = store.matterBySlug(slug);
  if (!scheme || !matter || matter.schemeId !== scheme.id) notFound();

  const location = store.locations().find((l) => l.id === matter.locationId);
  const org = matter.prosecutingOrgId
    ? store.allOrganizations().find((o) => o.id === matter.prosecutingOrgId)
    : undefined;
  const evidence = matter.evidenceIds
    .map((id) => store.evidenceById(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const related = [
    {
      href: `/schemes/${scheme.slug}`,
      label: scheme.name,
      hint: "Scheme home",
    },
    ...(org
      ? [
          {
            href: `/organizations/${org.slug}`,
            label: org.name,
            hint: "Prosecuting organization",
          },
        ]
      : []),
    ...(location
      ? [
          {
            href:
              location.type === "state"
                ? `/places/states/${location.slug}`
                : location.type === "lga"
                  ? `/places/lgas/${location.slug}`
                  : `/places`,
            label: location.name,
            hint: "Place",
          },
        ]
      : []),
  ];

  return (
    <RecordPage
      eyebrow={`Matter · ${matter.category.replace(/_/g, " ")}`}
      title={matter.title}
      subtitle={`${matter.status.replace(/_/g, " ")} · ${scheme.name}`}
      askContext={matter.title}
      follow={{ entityType: "matter", entityId: matter.id, entityTitle: matter.title }}
      actions={[
        { label: "Back to scheme", href: `/schemes/${scheme.slug}` },
        ...(org
          ? [{ label: "Open NGO", href: `/organizations/${org.slug}` }]
          : [{ label: "Publish a report", href: `/report?scheme=${scheme.slug}` }]),
      ]}
    >
      <RecordSection title="Evidence">
        <EvidenceMediaGallery
          items={evidence}
          emptyHint="No photos or videos linked to this matter yet."
        />
      </RecordSection>

      <RecordSection title="Status">
        <div className="flex flex-wrap items-center gap-2">
          <StatusLabel status={matter.verificationStatus} />
          <span className="text-xs uppercase tracking-wider text-ink-faint">
            {matter.status.replace(/_/g, " ")}
          </span>
          <span className="text-xs uppercase tracking-wider text-ink-faint">
            Privacy · {matter.privacyLevel}
          </span>
        </div>
        <p className="mt-4 prose-record">{matter.summary}</p>
        {matter.outcomeSummary ? (
          <p className="mt-4 border border-civic-green/30 bg-civic-greenSoft px-4 py-3 text-sm text-ink">
            Outcome note: {matter.outcomeSummary}
          </p>
        ) : null}
        <p className="mt-4 text-sm text-ink-faint">
          Occurred {matter.occurredAt}
          {location ? ` · ${location.name}` : null} · Published {matter.publishedAt}
          {matter.acceptedAt ? ` · Accepted ${matter.acceptedAt}` : null}
        </p>
      </RecordSection>

      <RecordSection title="Prosecuting organization">
        {org ? (
          <p className="prose-record">
            <Link href={`/organizations/${org.slug}`} className="text-civic-green hover:underline">
              {org.name}
            </Link>
            {" — "}
            {org.mission}
          </p>
        ) : (
          <p className="text-ink-muted">Awaiting a legal NGO.</p>
        )}
      </RecordSection>

      <p className="text-sm text-ink-faint">
        Reported incident on the public record — status describes process, not a court verdict.
      </p>

      <RecordSection title="Related">
        <RelatedLinks items={related} />
      </RecordSection>
    </RecordPage>
  );
}
