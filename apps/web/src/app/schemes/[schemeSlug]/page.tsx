import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection, RelatedLinks } from "@/components/RecordPage";
import { EntityList } from "@/components/ui";

export function generateStaticParams() {
  return store.allCivicSchemes().map((s) => ({ schemeSlug: s.slug }));
}

export default async function SchemePage({
  params,
}: {
  params: Promise<{ schemeSlug: string }>;
}) {
  const { schemeSlug } = await params;
  const scheme = store.schemeBySlug(schemeSlug);
  if (!scheme) notFound();

  const matters = store.mattersForScheme(scheme.id);
  const partnerOrgIds = [
    ...new Set(
      matters.map((m) => m.prosecutingOrgId).filter((id): id is string => Boolean(id)),
    ),
  ];
  const partners = partnerOrgIds
    .map((id) => store.allOrganizations().find((o) => o.id === id))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  // Also list legal_ngo orgs even if not yet assigned
  const legalNgos = store
    .allOrganizations()
    .filter((o) => o.type === "legal_ngo")
    .filter((o) => !partners.some((p) => p.id === o.id));

  return (
    <RecordPage
      eyebrow="Civic scheme"
      title={scheme.name}
      subtitle={scheme.tagline}
      askContext={scheme.name}
      actions={[
        { label: "Publish a report", href: `/report?scheme=${scheme.slug}` },
        { label: "Partner organizations", href: "/organizations" },
      ]}
    >
      <RecordSection title="About">
        <p className="prose-record">{scheme.summary}</p>
        <p className="mt-3 text-xs uppercase tracking-wider text-ink-faint">
          Status · {scheme.status}
        </p>
      </RecordSection>

      <RecordSection title="How it works">
        <ol className="list-decimal space-y-3 pl-5 text-ink-muted">
          {scheme.howItWorks.map((step) => (
            <li key={step} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
      </RecordSection>

      <RecordSection title="Safety and principle">
        <p className="prose-record">
          This scheme surfaces reported incidents and case progress. It does{" "}
          <strong>not</strong> declare criminal guilt. Do not dox, harass, or take the law into
          your own hands. Prefer community or LGA-level privacy for witnesses. Where appropriate,
          also report to the police or NHRC — publishing here is not a substitute for urgent
          personal safety.
        </p>
      </RecordSection>

      <RecordSection title="Matters on record">
        {matters.length === 0 ? (
          <p className="text-ink-muted">No matters published under this scheme yet.</p>
        ) : (
          <EntityList
            items={matters.map((m) => {
              const loc = store.locations().find((l) => l.id === m.locationId);
              const org = m.prosecutingOrgId
                ? store.allOrganizations().find((o) => o.id === m.prosecutingOrgId)
                : undefined;
              return {
                href: `/schemes/${scheme.slug}/${m.slug}`,
                title: m.title,
                description: m.summary.slice(0, 140) + (m.summary.length > 140 ? "…" : ""),
                kind: `${m.category.replace(/_/g, " ")} · ${m.status.replace(/_/g, " ")}`,
                meta: (
                  <span>
                    {loc?.name ?? "Location"}
                    {" · "}
                    {org ? (
                      <span className="text-civic-green">{org.name}</span>
                    ) : (
                      <span className="text-ink-faint">Awaiting NGO</span>
                    )}
                  </span>
                ),
                tone: (org ? "green" : "amber") as "green" | "amber",
              };
            })}
          />
        )}
      </RecordSection>

      <RecordSection title="Legal NGO partners">
        <RelatedLinks
          items={[...partners, ...legalNgos].map((o) => ({
            href: `/organizations/${o.slug}`,
            label: o.name,
            hint: o.mission,
          }))}
        />
      </RecordSection>

      <p className="mt-8 text-sm text-ink-faint">
        Prefer the mobile capture app when it ships. Until then, use{" "}
        <Link
          href={`/report?scheme=${scheme.slug}`}
          className="text-civic-green hover:underline"
        >
          the report form
        </Link>{" "}
        with a link to your video evidence.
      </p>
    </RecordPage>
  );
}
