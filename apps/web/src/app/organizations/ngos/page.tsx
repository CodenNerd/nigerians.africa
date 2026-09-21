import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import { PageIntro, EntityList } from "@/components/ui";

export const metadata = { title: "NGOs" };

export default async function AllNgosPage({
  searchParams,
}: {
  searchParams: Promise<{ vetted?: string }>;
}) {
  const { vetted } = await searchParams;
  const vettedOnly = vetted === "1" || vetted === "true";
  let ngos = store.allNgos();
  if (vettedOnly) {
    ngos = ngos.filter((o) => o.vettingStatus === "platform_vetted");
  }
  ngos = [...ngos].sort(
    (a, b) => store.organizationActivityScore(b) - store.organizationActivityScore(a),
  );

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Organizations"
        title={vettedOnly ? "Vetted NGOs" : "All NGOs"}
        subtitle={
          vettedOnly
            ? "Civil-society organisations that publish spend lines to earn platform trust."
            : "Browse civil-society organisations on the public record — sorted by activity."
        }
        meta={`${ngos.length} NGOs`}
      />

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link
          href="/organizations"
          className="text-ink-muted no-underline hover:text-civic-green"
        >
          ← Organizations hub
        </Link>
        {vettedOnly ? (
          <Link href="/organizations/ngos" className="text-civic-green no-underline hover:underline">
            Show all NGOs
          </Link>
        ) : (
          <Link
            href="/organizations/ngos?vetted=1"
            className="text-civic-green no-underline hover:underline"
          >
            Vetted only
          </Link>
        )}
      </div>

      <div className="mt-10">
        <EntityList
          items={ngos.map((o) => {
            const isVetted = o.vettingStatus === "platform_vetted";
            const catLabels = (o.ngoCategories ?? [])
              .map((id) => store.ngoCategoryMeta(id)?.label)
              .filter(Boolean)
              .join(" · ");
            return {
              href: `/organizations/${o.slug}`,
              title: o.name,
              description: o.mission,
              kind: isVetted ? "NGO · Platform vetted" : "NGO",
              meta: catLabels || undefined,
              tone: (isVetted ? "green" : "slate") as "green" | "slate",
              imageUrl: o.logoUrl,
            };
          })}
        />
      </div>
    </div>
  );
}
