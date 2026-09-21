import Link from "next/link";
import {
  NGO_CATEGORIES,
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

export default function OrganizationsPage() {
  const ngos = store.allNgos();
  const other = store.allOrganizations().filter((o) => !store.isNgo(o));
  const categories = NGO_CATEGORIES.map((cat) => ({
    ...cat,
    count: store.ngosByCategory(cat.id).length,
  }));

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Organizations"
        subtitle="NGOs by focus area — plus contractors and other civic actors. Vetted when they publish spend."
        meta={`${ngos.length} NGOs · ${store.allOrganizations().length} organizations`}
      />

      <div className="mt-6">
        <Link
          href="/organizations/ngos"
          className="font-mono text-[11px] uppercase tracking-wider text-civic-green no-underline hover:underline"
        >
          Browse all NGOs →
        </Link>
      </div>

      <section className="mt-14">
        <SectionHead
          title="NGO types"
          subtitle="Focus areas civil-society organisations work in — open a type to browse and see who is most active."
          meta={`${categories.length} types`}
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
          title="Most active in focus"
          subtitle="Spotlight NGOs with the most public-record activity in key categories."
          meta={`${SPOTLIGHT_CATEGORIES.length} categories`}
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
                    className="plane-link block bg-civic-blueSoft px-5 py-4 no-underline"
                  >
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-civic-blue">
                      {meta.label}
                    </span>
                    <span className="mt-1 block font-display text-xl text-ink">{top.name}</span>
                    <span className="mt-1 block text-sm text-ink-muted line-clamp-2">{top.mission}</span>
                    <span className="mt-2 block font-mono text-[11px] text-ink-faint">
                      Activity score {store.organizationActivityScore(top)}
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

      {other.length > 0 ? (
        <section className="mt-16">
          <SectionHead
            title="Other actors"
            subtitle="Contractors and organisations that are not tagged as NGOs."
            meta={`${other.length}`}
          />
          <EntityList
            items={other.map((o) => ({
              href: `/organizations/${o.slug}`,
              title: o.name,
              description: o.mission,
              kind: o.type,
              tone: "slate" as const,
            }))}
          />
        </section>
      ) : null}
    </div>
  );
}
