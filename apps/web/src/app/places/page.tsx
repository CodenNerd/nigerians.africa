import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import { PlacesMap } from "@/components/PlacesMap";
import { PageIntro, SectionHead, EntityList } from "@/components/ui";
import { buildGodsEyePoints } from "@/lib/gods-eye-points";

export const metadata = { title: "Places" };

export default function PlacesPage() {
  const locations = store.locations();
  const states = locations.filter((l) => l.type === "state");
  const points = buildGodsEyePoints();

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Places"
        subtitle="Geographic civic twin — toggle problems, projects, reports and offices on the map. Lists remain available for accessibility and low bandwidth."
        meta={`${states.length} states · ${points.length} map points`}
      />
      <div className="mt-8">
        <PlacesMap points={points} showLayers center={[6.52, 3.38]} />
      </div>
      <section className="mt-14">
        <SectionHead title="States in this record" meta={`${states.length}`} />
        <EntityList
          items={states.map((s) => ({
            href: `/places/states/${s.slug}`,
            title: s.name,
            description: s.summary,
            kind: "State",
            tone: "green" as const,
          }))}
        />
      </section>
      <p className="mt-6 text-sm text-ink-faint">
        Looking for an LGA? Start from a{" "}
        <Link href="/places/states/lagos-state" className="text-civic-green hover:underline">
          state page
        </Link>{" "}
        or search.
      </p>
    </div>
  );
}
