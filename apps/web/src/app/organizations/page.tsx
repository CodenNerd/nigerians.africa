import Link from "next/link";
import Image from "next/image";
import {
  NGO_CATEGORIES,
  ORGANIZATION_TYPES,
  store,
  type NgoCategoryId,
} from "@nigeria-for-nigerians/domain";
import { PageIntro, SectionHead, EntityList } from "@/components/ui";

export const metadata = { title: "Organizations" };

const SPOTLIGHT_CATEGORIES: NgoCategoryId[] = [
  "legal_aid",
  "anti_corruption",
  "health",
  "civic",
];

/** Actor forms to spotlight with a top org when the type has members. */
const SPOTLIGHT_TYPES = ["ngo", "community_organization", "contractor"] as const;

export default function OrganizationsPage() {
  const ngos = store.allNgos();
  const all = store.allOrganizations();
  const actorTypes = ORGANIZATION_TYPES.map((t) => ({
    ...t,
    count: store.organizationsByType(t.id).length,
  }));
  const categories = NGO_CATEGORIES.map((cat) => ({
    ...cat,
    count: store.ngosByCategory(cat.id).length,
  }));

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Organizations"
        subtitle="NGOs, community associations, contractors and other civic actors — by form and, for NGOs, by focus area."
        meta={`${all.length} organizations · ${ngos.length} NGOs`}
      />

      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href="/organizations/ngos"
          className="font-mono text-[11px] uppercase tracking-wider text-civic-green no-underline hover:underline"
        >
          Browse all NGOs →
        </Link>
        <Link
          href="/organizations/types/community_organization"
          className="font-mono text-[11px] uppercase tracking-wider text-civic-blue no-underline hover:underline"
        >
          Community organizations →
        </Link>
        <Link
          href="/organizations/types/contractor"
          className="font-mono text-[11px] uppercase tracking-wider text-civic-amber no-underline hover:underline"
        >
          Contractors →
        </Link>
      </div>

      <section className="mt-14">
        <SectionHead
          title="Organization types"
          subtitle="How the actor is organised — NGO, community association, contractor, foundation, and more."
          meta={`${actorTypes.length} forms`}
        />
        <ul className="mt-6 grid gap-px bg-paper-border sm:grid-cols-2 lg:grid-cols-3">
          {actorTypes.map((t) => (
            <li key={t.id}>
              <Link
                href={`/organizations/types/${t.id}`}
                className="plane-link block bg-civic-blueSoft px-4 py-4 no-underline"
              >
                <span className="font-display text-lg text-ink">{t.label}</span>
                <span className="mt-1 block text-sm text-ink-muted">{t.description}</span>
                <span className="mt-2 block font-mono text-[11px] uppercase tracking-wider text-civic-blue">
                  {t.count} {t.count === 1 ? "organization" : "organizations"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <SectionHead
          title="By type — most active"
          subtitle="Highest public-record activity in the forms that already have seed organisations."
          meta={`${SPOTLIGHT_TYPES.length}`}
        />
        <ul className="mt-6 grid gap-px bg-paper-border sm:grid-cols-3">
          {SPOTLIGHT_TYPES.map((typeId) => {
            const meta = store.organizationTypeMeta(typeId);
            const top = [...store.organizationsByType(typeId)].sort(
              (a, b) =>
                store.organizationActivityScore(b) - store.organizationActivityScore(a),
            )[0];
            if (!meta) return null;
            return (
              <li key={typeId}>
                {top ? (
                  <Link
                    href={`/organizations/${top.slug}`}
                    className="plane-link flex gap-3 bg-civic-amberSoft px-4 py-4 no-underline"
                  >
                    {top.logoUrl ? (
                      <span className="relative mt-0.5 h-12 w-12 shrink-0 overflow-hidden border border-paper-border bg-paper">
                        <Image src={top.logoUrl} alt="" fill className="object-cover" sizes="48px" />
                      </span>
                    ) : null}
                    <span className="min-w-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-civic-amber">
                        {meta.label}
                      </span>
                      <span className="mt-1 block font-display text-lg text-ink">{top.name}</span>
                      <span className="mt-1 block text-sm text-ink-muted line-clamp-2">
                        {top.mission}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <div className="bg-paper px-4 py-4">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                      {meta.label}
                    </span>
                    <p className="mt-2 text-sm text-ink-muted">None in the record yet.</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-16">
        <SectionHead
          title="NGO focus areas"
          subtitle="What civil-society organisations work on — open a focus to browse and see who is most active."
          meta={`${categories.length} areas`}
        />
        <ul className="mt-6 grid gap-px bg-paper-border sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/organizations/ngos/${cat.id}`}
                className="plane-link block bg-civic-greenSoft px-4 py-4 no-underline"
              >
                <span className="font-display text-lg text-ink">{cat.label}</span>
                <span className="mt-1 block text-sm text-ink-muted">{cat.description}</span>
                <span className="mt-2 block font-mono text-[11px] uppercase tracking-wider text-civic-green">
                  {cat.count} {cat.count === 1 ? "NGO" : "NGOs"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <SectionHead
          title="Most active in NGO focus"
          subtitle="Spotlight NGOs with the most public-record activity in key focus areas."
          meta={`${SPOTLIGHT_CATEGORIES.length} areas`}
        />
        <ul className="mt-6 grid gap-px bg-paper-border sm:grid-cols-2">
          {SPOTLIGHT_CATEGORIES.map((catId) => {
            const meta = store.ngoCategoryMeta(catId);
            const top = store.mostActiveNgos(1, catId)[0];
            if (!meta) return null;
            return (
              <li key={catId}>
                {top ? (
                  <Link
                    href={`/organizations/${top.slug}`}
                    className="plane-link flex gap-4 bg-civic-blueSoft px-5 py-4 no-underline"
                  >
                    {top.logoUrl ? (
                      <span className="relative mt-0.5 h-14 w-14 shrink-0 overflow-hidden border border-paper-border bg-paper">
                        <Image src={top.logoUrl} alt="" fill className="object-cover" sizes="56px" />
                      </span>
                    ) : null}
                    <span className="min-w-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-civic-blue">
                        {meta.label}
                      </span>
                      <span className="mt-1 block font-display text-xl text-ink">{top.name}</span>
                      <span className="mt-1 block text-sm text-ink-muted line-clamp-2">
                        {top.mission}
                      </span>
                      <span className="mt-2 block font-mono text-[11px] text-ink-faint">
                        Activity score {store.organizationActivityScore(top)}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <div className="bg-paper px-5 py-4">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                      {meta.label}
                    </span>
                    <p className="mt-2 text-sm text-ink-muted">No NGOs in this category yet.</p>
                    <Link
                      href={`/organizations/ngos/${catId}`}
                      className="mt-2 inline-block text-sm text-civic-green no-underline hover:underline"
                    >
                      Open category →
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-16">
        <SectionHead
          title="All NGOs"
          subtitle="Civil-society organisations on the public record, sorted by activity."
          meta={`${ngos.length}`}
        />
        <EntityList
          items={[...ngos]
            .sort(
              (a, b) =>
                store.organizationActivityScore(b) - store.organizationActivityScore(a),
            )
            .slice(0, 12)
            .map((o) => {
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
                kind: vetted ? `NGO · Platform vetted` : "NGO",
                meta: catLabels || undefined,
                tone: (vetted ? "green" : "slate") as "green" | "slate",
                imageUrl: o.logoUrl,
              };
            })}
        />
        {ngos.length > 12 ? (
          <p className="mt-4">
            <Link
              href="/organizations/ngos"
              className="text-sm text-civic-green no-underline hover:underline"
            >
              See all {ngos.length} NGOs →
            </Link>
          </p>
        ) : null}
      </section>
    </div>
  );
}
