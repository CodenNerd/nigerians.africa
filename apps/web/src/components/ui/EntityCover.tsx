import Image from "next/image";

/** Thin cover strip for problem / place / organization dossiers. */
export function EntityCover({
  title,
  coverUrl,
  coverCredit,
  eyebrow,
}: {
  title: string;
  coverUrl?: string;
  coverCredit?: string;
  eyebrow?: string;
}) {
  if (!coverUrl) return null;

  return (
    <header className="relative mb-10 border-b border-paper-border">
      <div className="relative isolate h-[11rem] w-full overflow-hidden sm:h-[14rem]">
        <Image
          src={coverUrl}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          {eyebrow ? (
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/80">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 font-display text-2xl text-white sm:text-3xl">{title}</h1>
          {coverCredit ? (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-white/60">
              {coverCredit}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
