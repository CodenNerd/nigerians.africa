import Link from "next/link";
import { notFound } from "next/navigation";
import {
  NGO_CATEGORIES,
  isNgoCategoryId,
  store,
  type NgoCategoryId,
} from "@nigeria-for-nigerians/domain";
import { PageIntro, SectionHead, EntityList } from "@/components/ui";

export function generateStaticParams() {
  return NGO_CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = store.ngoCategoryMeta(category);
  return { title: meta ? `${meta.label} NGOs` : "NGO category" };
}

export default async function NgoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: raw } = await params;
  if (!isNgoCategoryId(raw)) notFound();
  const category = raw as NgoCategoryId;
  const meta = store.ngoCategoryMeta(category);
  if (!meta) notFound();

  const ngos = [...store.ngosByCategory(category)].sort(
    (a, b) => store.organizationActivityScore(b) - store.organizationActivityScore(a),
  );
  const spotlight = store.mostActiveNgos(3, category);

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="NGO type"
        title={meta.label}
        subtitle={`${meta.description}. Examples: ${meta.examples}.`}
        meta={`${ngos.length} ${ngos.length === 1 ? "NGO" : "NGOs"}`}
      />

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link
          href="/organizations"
          className="text-ink-muted no-underline hover:text-civic-green"
        >
          ← Organizations hub
        </Link>
        <Link
          href="/organizations/ngos"
          className="text-civic-green no-underline hover:underline"
        >
          All NGOs
        </Link>
      </div>

      {spotlight.length > 0 ? (
        <section className="mt-12">
          <SectionHead
            title="Most active"
            subtitle={`Highest public-record activity in ${meta.label}.`}
            meta={`${spotlight.length}`}
          />
          <ul className="mt-6 grid gap-px bg-paper-border sm:grid-cols-3">
            {spotlight.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/organizations/${o.slug}`}
                  className="plane-link block bg-civic-amberSoft px-4 py-4 no-underline"
                >
                  <span className="font-display text-lg text-ink">{o.name}</span>
                  <span className="mt-1 block text-sm text-ink-muted line-clamp-2">{o.mission}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-14">
        <SectionHead title="Organizations in this type" meta={`${ngos.length}`} />
        {ngos.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">
            No NGOs tagged with this focus yet. Browse{" "}
            <Link href="/organizations/ngos" className="text-civic-green hover:underline">
              all NGOs
            </Link>{" "}
            or return to the{" "}
            <Link href="/organizations" className="text-civic-green hover:underline">
              organizations hub
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6">
            <EntityList
              items={ngos.map((o) => {
                const vetted = o.vettingStatus === "platform_vetted";
                return {
                  href: `/organizations/${o.slug}`,
                  title: o.name,
                  description: o.mission,
                  kind: vetted ? "NGO · Platform vetted" : "NGO",
                  meta: `Activity ${store.organizationActivityScore(o)}`,
                  tone: (vetted ? "green" : "slate") as "green" | "slate",
                };
              })}
            />
          </div>
        )}
      </section>
    </div>
  );
}
