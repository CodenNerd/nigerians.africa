import { store } from "@nigeria-for-nigerians/domain";
import { PageIntro, EntityList } from "@/components/ui";

export const metadata = { title: "Events" };

export default function EventsPage() {
  const events = store.events();
  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Events"
        subtitle="Elections, announcements and civic events preserved in the public record. Newest first."
        meta={`${events.length} events`}
      />
      <EntityList
        items={events.map((e) => ({
          href: e.type === "election" ? `/events/elections/${e.slug}` : `/events/${e.slug}`,
          title: e.title,
          description: e.summary,
          kind: e.type,
          date: e.date,
          tone: "blue" as const,
        }))}
      />
    </div>
  );
}
