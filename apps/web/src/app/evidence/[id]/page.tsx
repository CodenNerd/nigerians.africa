import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection, SourceList } from "@/components/RecordPage";
import { StatusLabel } from "@/components/StatusLabel";

export function generateStaticParams() {
  return store.raw.evidence.map((e) => ({ id: e.id }));
}

export default async function EvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evidence = store.evidenceById(id);
  if (!evidence) notFound();

  const source = store.sourceById(evidence.sourceId);

  return (
    <RecordPage
      eyebrow={`Evidence · ${evidence.type}`}
      title={evidence.title}
      subtitle={evidence.description}
      status={evidence.verificationStatus}
      askContext={evidence.title}
    >
      <RecordSection title="Provenance">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-faint">Captured</dt>
            <dd>{evidence.capturedAt}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">File</dt>
            <dd className="font-mono">{evidence.fileLabel ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Related</dt>
            <dd>
              {evidence.relatedEntityType} / {evidence.relatedEntityId}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Status</dt>
            <dd>
              <StatusLabel status={evidence.verificationStatus} />
            </dd>
          </div>
        </dl>
      </RecordSection>

      <RecordSection title="Source">
        <SourceList
          items={
            source
              ? [
                  {
                    id: source.id,
                    title: source.title,
                    publisher: source.publisher,
                    date: source.publicationDate,
                  },
                ]
              : []
          }
        />
      </RecordSection>

      <p className="text-sm">
        <Link href="/projects/allen-avenue-spur-rehabilitation" className="text-civic-green">
          ← Back to signature project
        </Link>
      </p>
    </RecordPage>
  );
}
