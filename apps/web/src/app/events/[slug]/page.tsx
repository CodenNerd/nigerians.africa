import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection } from "@/components/RecordPage";

export function generateStaticParams() {
  return store
    .events()
    .filter((e) => e.type !== "election")
    .map((e) => ({ slug: e.slug }));
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = store.eventBySlug(slug);
  if (!event || event.type === "election") notFound();

  return (
    <RecordPage eyebrow={`Event · ${event.type}`} title={event.title} subtitle={event.summary} askContext={event.title} contributions={{ entityType: "event", entityId: event.id, entityTitle: event.title }}>
      <RecordSection title="Summary">
        <p className="prose-record">{event.summary}</p>
        <p className="mt-3 text-sm text-ink-faint">
          {event.date} · Status: {event.status}
        </p>
      </RecordSection>
    </RecordPage>
  );
}
