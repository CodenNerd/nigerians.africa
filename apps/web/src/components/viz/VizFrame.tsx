import type { ReactNode } from "react";

/** Shared chrome for visualisation surfaces (maps, tile mosaics, future charts). */
export function VizFrame({
  eyebrow,
  title,
  meta,
  children,
}: {
  eyebrow?: string;
  title?: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {(eyebrow || title || meta) && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            {eyebrow ? (
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-1 font-display text-2xl tracking-tight text-ink sm:text-3xl">
                {title}
              </h2>
            ) : null}
          </div>
          {meta ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">{meta}</p>
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
}
