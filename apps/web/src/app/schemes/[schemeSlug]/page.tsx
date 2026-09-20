import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RelatedLinks } from "@/components/RecordPage";
import {
  MatterReel,
  SchemeGlance,
  SchemeLoop,
  SchemeSafetyStrip,
} from "@/components/viz";

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
  const glance = store.schemeGlance(scheme.id);
  const reportHref = `/report?scheme=${scheme.slug}`;

  const reelItems = matters.map((m) => {
    const location = store.locations().find((l) => l.id === m.locationId);
    const org = m.prosecutingOrgId
      ? store.allOrganizations().find((o) => o.id === m.prosecutingOrgId)
      : undefined;
    const evidence = m.evidenceIds
      .map((id) => store.evidenceById(id))
      .find((e) => e && (e.mediaKind === "video" || e.mediaKind === "image"));
    return {
      matter: m,
      locationName: location?.name,
      org,
      evidence,
      href: `/schemes/${scheme.slug}/${m.slug}`,
    };
  });

  const partners = store
    .allOrganizations()
    .filter((o) => o.type === "legal_ngo")
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <RecordPage
      eyebrow="Civic scheme"
      title={scheme.name}
      subtitle={scheme.tagline}
      askContext={scheme.name}
      actions={[
        { label: "Publish a report", href: reportHref },
        { label: "Partner organizations", href: "/organizations" },
      ]}
    >
      <div className="space-y-14 lg:space-y-16">
        <MatterReel items={reelItems} />

        <SchemeGlance glance={glance} />

        <SchemeLoop glance={glance} schemeSlug={scheme.slug} />

        <section>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
            Legal NGO partners
          </p>
          <div className="mt-4">
            <RelatedLinks
              items={partners.map((o) => ({
                href: `/organizations/${o.slug}`,
                label: o.name,
                hint: `${o.type.replace(/_/g, " ")} · ${store.mattersForOrganization(o.id).length} matters`,
              }))}
            />
          </div>
        </section>

        <SchemeSafetyStrip reportHref={reportHref} />
      </div>
    </RecordPage>
  );
}
