import Image from "next/image";

/** Full-bleed cover hero for project dossiers — photo first, minimal chrome. */
export function ProjectCover({
  title,
  coverUrl,
  coverCredit,
  locationName,
  workStatus,
  verificationLabel,
}: {
  title: string;
  coverUrl?: string;
  coverCredit?: string;
  locationName?: string;
  workStatus: string;
  verificationLabel?: string;
}) {
  const metaBits = [
    locationName,
    workStatus.replace(/_/g, " "),
    verificationLabel,
  ].filter(Boolean);

  return (
    <header className="relative border-b border-paper-border">
      <div className="relative isolate h-[16rem] w-full overflow-hidden sm:h-[20rem] lg:h-[22rem]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-civic-slate via-ink to-ink" />
        )}
        {/* Single bottom wash — keep the photo readable */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"
          aria-hidden
        />

        <div className="absolute inset-x-0 bottom-0">
          <div className="site-container pb-6 pt-16 sm:pb-7 sm:pt-20">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/55">
              Project
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h1>
            {metaBits.length > 0 ? (
              <p className="mt-2.5 font-mono text-[11px] tracking-wide text-white/60 sm:text-xs">
                {metaBits.join(" · ")}
              </p>
            ) : null}
          </div>
        </div>

        {coverCredit ? (
          <p className="absolute bottom-2 right-3 max-w-[14rem] text-right font-mono text-[9px] leading-snug text-white/40 sm:bottom-3 sm:right-5">
            {coverCredit}
          </p>
        ) : null}
      </div>
    </header>
  );
}
