import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ORGANIZATION_TYPES,
  isOrganizationTypeId,
  store,
  type OrganizationTypeId,
} from "@nigeria-for-nigerians/domain";
import { PageIntro, SectionHead, EntityList } from "@/components/ui";

export function generateStaticParams() {
  return ORGANIZATION_TYPES.map((t) => ({ type: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const meta = store.organizationTypeMeta(type);
  return { title: meta ? `${meta.label} organizations` : "Organization type" };
}

export default async function OrganizationTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: raw } = await params;
  if (!isOrganizationTypeId(raw)) notFound();
  const typeId = raw as OrganizationTypeId;
  const meta = store.organizationTypeMeta(typeId);
  if (!meta) notFound();

  const orgs = [...store.organizationsByType(typeId)].sort(
    (a, b) => store.organizationActivityScore(b) - store.organizationActivityScore(a),
  );

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Organization type"
        title={meta.label}
        subtitle={`${meta.description} Examples: ${meta.examples}.`}
        meta={`${orgs.length} ${orgs.length === 1 ? "organization" : "organizations"}`}
      />

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link
          href="/organizations"
          className="text-ink-muted no-underline hover:text-civic-green"
        >
          ← Organizations hub
        </Link>
        {typeId === "ngo" ? (
          <Link
            href="/organizations/ngos"
            className="text-civic-green no-underline hover:underline"
          >
            Browse NGO focus areas
          </Link>
        ) : null}
      </div>

      <section className="mt-14">
        <SectionHead title="Organizations of this type" meta={`${orgs.length}`} />
        {orgs.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">
            No {meta.label.toLowerCase()} organisations in the public record yet. Return to the{" "}
            <Link href="/organizations" className="text-civic-green hover:underline">
              organizations hub
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6">
            <EntityList
              items={orgs.map((o) => {
                const vetted = o.vettingStatus === "platform_vetted";
                const catLabels = (o.ngoCategories ?? [])
                  .map((id) => store.ngoCategoryMeta(id)?.label)
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(" · ");
                return {
                  href: `/organizations/${o.slug}`,
                  title: o.name,
                  description: o.mission,
                  kind: vetted ? `${meta.label} · Platform vetted` : meta.label,
                  meta: catLabels || undefined,
                  tone: (vetted ? "green" : typeId === "contractor" ? "amber" : "slate") as
                    | "green"
                    | "amber"
                    | "slate",
                  imageUrl: o.logoUrl,
                };
              })}
            />
          </div>
        )}
      </section>
    </div>
  );
}
