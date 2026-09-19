import Image from "next/image";
import Link from "next/link";
import type { Evidence } from "@nigeria-for-nigerians/domain";
import { StatusLabel } from "@/components/StatusLabel";

function isMedia(e: Evidence): boolean {
  return Boolean(e.mediaUrl) && (e.mediaKind === "image" || e.mediaKind === "video");
}

export function EvidenceMediaGallery({
  items,
  emptyHint = "No photos or videos attached to this project yet.",
}: {
  items: Evidence[];
  emptyHint?: string;
}) {
  const media = items.filter(isMedia);
  if (!media.length) {
    return <p className="text-sm text-ink-muted">{emptyHint}</p>;
  }

  return (
    <ul className="grid gap-px bg-paper-border sm:grid-cols-2">
      {media.map((e, i) => {
        const isVideo = e.mediaKind === "video";
        const src = isVideo ? e.posterUrl || e.mediaUrl! : e.mediaUrl!;
        const large = i === 0;

        return (
          <li
            key={e.id}
            className={`relative bg-paper ${large ? "sm:col-span-2" : ""}`}
          >
            <Link
              href={`/evidence/${e.id}`}
              className="plane-link group relative block no-underline"
            >
              <div
                className={`relative w-full overflow-hidden bg-ink/10 ${
                  large ? "aspect-[16/9]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition duration-300 group-hover:brightness-[0.97]"
                  sizes={large ? "(max-width: 768px) 100vw, 720px" : "(max-width: 768px) 100vw, 360px"}
                />
                {isVideo ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/25">
                    <span className="border border-paper bg-paper/90 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink">
                      Play video
                    </span>
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-start justify-between gap-2 px-3 py-3 sm:px-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                    {isVideo ? "Video" : "Photo"} · {e.capturedAt}
                  </p>
                  <p className="mt-1 font-medium text-ink group-hover:underline">{e.title}</p>
                </div>
                <StatusLabel status={e.verificationStatus} />
              </div>
            </Link>
            {isVideo && e.mediaUrl ? (
              <a
                href={e.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-3 z-10 border border-paper bg-paper/95 px-2 py-1 text-[10px] uppercase tracking-wider text-civic-green no-underline"
              >
                External
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
