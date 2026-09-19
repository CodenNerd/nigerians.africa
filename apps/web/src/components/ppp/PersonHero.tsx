import Image from "next/image";
import Link from "next/link";
import type { Office, Person } from "@nigeria-for-nigerians/domain";

export function PersonHero({
  person,
  currentOffice,
}: {
  person: Person;
  currentOffice?: Office;
}) {
  const credit = person.imageCredit;

  return (
    <header className="relative">
      <div className="relative isolate h-[22rem] w-full overflow-hidden sm:h-[26rem] lg:h-[30rem]">
        {person.coverUrl ? (
          <Image
            src={person.coverUrl}
            alt="Nigerian Presidential Complex, Abuja"
            fill
            priority
            className="object-cover object-[center_42%]"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-civic-blue via-civic-slate to-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/45 to-ink/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-ink/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="site-container pb-9 pt-28 sm:pb-11 lg:pb-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/60">
              Public Personality Profile
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-[2.55rem] leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
              {person.fullName}
            </h1>
            {person.aliases.length > 0 ? (
              <p className="mt-3 font-mono text-xs tracking-wide text-white/50 sm:text-sm">
                {person.aliases.join("  ·  ")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {currentOffice ? (
        <div className="border-b border-paper-border bg-civic-greenSoft">
          <div className="site-container">
            <div className="flex flex-col gap-6 py-7 sm:flex-row sm:items-end sm:gap-8 sm:py-8 lg:gap-10">
              <div className="relative z-10 -mt-16 h-40 w-32 shrink-0 overflow-hidden border-[3px] border-paper bg-paper shadow-[0_16px_48px_rgba(0,0,0,0.22)] sm:-mt-20 sm:h-48 sm:w-36 lg:-mt-24 lg:h-56 lg:w-40">
                {person.photoUrl ? (
                  <Image
                    src={person.photoUrl}
                    alt={`Portrait of ${person.fullName}`}
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-civic-green font-display text-3xl text-white">
                    {person.photoInitials}
                  </div>
                )}
              </div>

              <Link
                href={`/government/offices/${currentOffice.slug}`}
                className="group min-w-0 flex-1 no-underline"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-civic-green">
                  Current office
                </span>
                <span className="mt-2 block font-display text-2xl leading-[1.12] text-ink transition group-hover:text-civic-green sm:text-3xl lg:text-[2.25rem]">
                  {currentOffice.title}
                </span>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                  {currentOffice.mandate}
                </p>
              </Link>

              <Link
                href={`/government/offices/${currentOffice.slug}`}
                className="hidden shrink-0 self-center border border-civic-green/25 bg-paper/70 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-civic-green no-underline transition hover:border-civic-green/50 hover:bg-paper sm:block"
              >
                Enter office →
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="site-container py-8 sm:py-9">
        <p className="max-w-3xl text-base leading-relaxed text-ink-muted sm:text-lg">{person.bio}</p>
        <p className="mt-3 max-w-2xl text-sm italic text-ink-faint">
          This is a structured public record, not a judgment about the person.
        </p>

        <div className="mt-6 inline-flex flex-wrap gap-px bg-paper-border">
          {[
            { href: "#sources", label: "View sources" },
            { href: "/action", label: "Follow" },
            { href: "/report", label: "Report an issue" },
          ].map((a) => (
            <Link
              key={a.href + a.label}
              href={a.href}
              className="bg-paper-card px-4 py-2.5 text-sm text-ink no-underline transition hover:bg-civic-greenSoft hover:text-civic-green"
            >
              {a.label}
            </Link>
          ))}
        </div>

        {credit ? (
          <p className="mt-6 max-w-3xl text-[11px] leading-relaxed text-ink-faint">
            Portrait: {credit.photographer} ({credit.license}) via{" "}
            <a href={credit.sourceUrl} className="underline" rel="noopener noreferrer" target="_blank">
              Wikimedia Commons
            </a>
            {credit.coverPhotographer ? (
              <>
                . Cover: Nigerian Presidential Complex — {credit.coverPhotographer} (
                {credit.coverLicense}) via{" "}
                <a
                  href={credit.coverSourceUrl}
                  className="underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Wikimedia Commons
                </a>
              </>
            ) : null}
            .
          </p>
        ) : null}
      </div>
    </header>
  );
}
