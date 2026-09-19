import Image from "next/image";
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
  const isImage = evidence.mediaKind === "image" && evidence.mediaUrl;
  const isVideo = evidence.mediaKind === "video" && evidence.mediaUrl;
  const poster = evidence.posterUrl || (isImage ? evidence.mediaUrl : undefined);

  const relatedProject =
    evidence.relatedEntityType === "project"
      ? store.raw.projects.find((p) => p.id === evidence.relatedEntityId)
      : undefined;

  return (
    <RecordPage
      eyebrow={`Evidence · ${evidence.type}`}
      title={evidence.title}
      subtitle={evidence.description}
      status={evidence.verificationStatus}
      askContext={evidence.title}
    >
      {(isImage || isVideo) && (
        <RecordSection title="Media">
          {isImage ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink/10">
              <Image
                src={evidence.mediaUrl!}
                alt={evidence.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 720px"
              />
            </div>
          ) : null}
          {isVideo ? (
            <div>
              {poster ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink/10">
                  <Image
                    src={poster}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 720px"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/30">
                    <span className="border border-paper bg-paper/95 px-3 py-1.5 text-[11px] uppercase tracking-wider text-ink">
                      Video
                    </span>
                  </span>
                </div>
              ) : null}
              <a
                href={evidence.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-civic-green"
              >
                Play video (external) →
              </a>
            </div>
          ) : null}
        </RecordSection>
      )}

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
        <Link
          href={
            relatedProject
              ? `/projects/${relatedProject.slug}`
              : "/projects/allen-avenue-spur-rehabilitation"
          }
          className="text-civic-green"
        >
          ← Back to {relatedProject ? "project" : "signature project"}
        </Link>
      </p>
    </RecordPage>
  );
}
