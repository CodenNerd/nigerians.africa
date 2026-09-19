import { store } from "@nigeria-for-nigerians/domain";
import { PageIntro, EntityList } from "@/components/ui";

export const metadata = { title: "Civic guidance" };

export default function GuidanceIndexPage() {
  const topics = store.guidance();
  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Participate"
        title="What happened?"
        subtitle="Practical next steps in plain language — rights, evidence to keep, who is responsible, where to report."
        meta={`${topics.length} topics`}
      />
      <EntityList
        items={topics.map((t) => ({
          href: `/guidance/${t.slug}`,
          title: t.title,
          description: t.situation,
          kind: t.category,
          tone: "green" as const,
        }))}
      />
    </div>
  );
}
