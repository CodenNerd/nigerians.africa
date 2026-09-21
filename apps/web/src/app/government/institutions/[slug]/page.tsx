import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection, RelatedLinks, Timeline } from "@/components/RecordPage";

export function generateStaticParams() {
  return store.allInstitutions().map((i) => ({ slug: i.slug }));
}

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const inst = store.institutionBySlug(slug);
  if (!inst) notFound();

  const offices = store.allOffices().filter((o) => o.institutionId === inst.id);
  const children = store.allInstitutions().filter((i) => i.parentId === inst.id);
  const memory = store
    .allMemory()
    .filter((m) => offices.some((o) => m.entityId === o.id || m.description.includes(inst.name.split(" ")[0])));

  return (
    <RecordPage
      eyebrow={`Government · ${inst.level}`}
      title={inst.name}
      subtitle={inst.description}
      askContext={inst.name}
      avatarUrl={inst.logoUrl}
    >
      <RecordSection title="What this institution does">
        <p className="prose-record">{inst.mandate}</p>
        {inst.website ? (
          <p className="mt-3 text-sm text-ink-faint">Official website reference: {inst.website}</p>
        ) : null}
      </RecordSection>

      <RecordSection title="Offices">
        <RelatedLinks
          items={offices.map((o) => ({
            href: `/government/offices/${o.slug}`,
            label: o.name,
            hint: o.title,
          }))}
        />
      </RecordSection>

      {children.length ? (
        <RecordSection title="Related institutions">
          <RelatedLinks
            items={children.map((c) => ({
              href: `/government/institutions/${c.slug}`,
              label: c.name,
              hint: c.type,
            }))}
          />
        </RecordSection>
      ) : null}

      <RecordSection title="Public record excerpts">
        <Timeline
          items={memory.slice(0, 8).map((m) => ({
            date: m.date,
            title: m.eventType,
            description: m.description,
          }))}
        />
      </RecordSection>
    </RecordPage>
  );
}
