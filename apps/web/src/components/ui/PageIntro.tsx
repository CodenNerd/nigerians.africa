export function PageIntro({
  eyebrow,
  title,
  subtitle,
  meta,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: string;
}) {
  return (
    <header className="anim-rise max-w-3xl">
      {eyebrow ? (
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-faint">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl ${
          eyebrow ? "mt-3" : ""
        }`}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {subtitle}
        </p>
      ) : null}
      {meta ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          {meta}
        </p>
      ) : null}
    </header>
  );
}
