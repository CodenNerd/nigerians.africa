import Image from "next/image";
import type { ReactNode } from "react";
import { StatusLabel } from "@/components/StatusLabel";
import type { VerificationStatus } from "@nigeria-for-nigerians/domain";

/** Full-bleed cover hero for project dossiers. */
export function ProjectCover({
  title,
  subtitle,
  coverUrl,
  coverCredit,
  status,
  meta,
}: {
  title: string;
  subtitle?: string;
  coverUrl?: string;
  coverCredit?: string;
  status?: VerificationStatus;
  meta?: ReactNode;
}) {
  return (
    <header className="relative">
      <div className="relative isolate h-[18rem] w-full overflow-hidden sm:h-[22rem] lg:h-[26rem]">
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
          <div className="absolute inset-0 bg-gradient-to-br from-civic-green via-civic-slate to-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/50 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="site-container pb-8 pt-24 sm:pb-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/60">
              Project
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {status ? <StatusLabel status={status} /> : null}
              {meta ? <span className="text-sm text-white/65">{meta}</span> : null}
            </div>
            {coverCredit ? (
              <p className="mt-4 font-mono text-[10px] text-white/45">{coverCredit}</p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
