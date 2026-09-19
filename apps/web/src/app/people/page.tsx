import Link from "next/link";
import Image from "next/image";
import { store } from "@nigeria-for-nigerians/domain";
import { PageIntro } from "@/components/ui";

export const metadata = { title: "People" };

export default function PeoplePage() {
  const people = store.allPeople();
  const featured = people.find((p) => p.slug === "bola-ahmed-tinubu");
  const rest = people
    .filter((p) => p.slug !== "bola-ahmed-tinubu")
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const featuredOffice = featured
    ? (() => {
        const tenure = store.tenuresForPerson(featured.id).find((t) => !t.endDate);
        return tenure ? store.allOffices().find((o) => o.id === tenure.officeId) : undefined;
      })()
    : undefined;

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="People"
        subtitle="Public Personality Profiles — structured public research records, not social profiles."
        meta={`${people.length} personalities`}
      />

      <section id="criteria" className="mt-10 max-w-2xl scroll-mt-28 border border-paper-border bg-paper-card p-6">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
          Who appears here
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          A Public Personality Profile is created when someone is a public personality under published
          criteria — not by rumour or private interest. In scope: current and recent office holders;
          declared candidates for public office; people who exercise public power or stewardship of
          public money; and others whose public role is documented with provenance. Profiles organise
          promises, statements, claims and allegations with status labels — never a true/false
          verdict.
        </p>
        <p className="mt-3 text-sm text-ink-faint">
          Verifiers review claim and evidence status at the{" "}
          <Link href="/admin" className="text-civic-green hover:underline">
            verifier desk
          </Link>
          .
        </p>
      </section>

      {featured ? (
        <Link
          href={`/people/${featured.slug}`}
          className="plane-link mt-10 grid overflow-hidden sm:grid-cols-[14rem_1fr]"
        >
          <div className="relative min-h-[14rem] bg-civic-slate">
            {featured.photoUrl ? (
              <Image
                src={featured.photoUrl}
                alt=""
                fill
                className="object-cover object-top"
                sizes="224px"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-4xl text-white">
                {featured.photoInitials}
              </div>
            )}
          </div>
          <div className="bg-civic-greenSoft p-6 sm:p-8">
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-civic-green">
              Featured profile
            </div>
            <div className="mt-2 font-display text-3xl tracking-tight text-ink">{featured.fullName}</div>
            {featuredOffice ? (
              <p className="mt-2 text-lg text-civic-green">{featuredOffice.title}</p>
            ) : (
              <p className="mt-2 text-ink-muted">{featured.classification}</p>
            )}
            <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{featured.bio}</p>
            <span className="mt-5 inline-block font-mono text-[11px] uppercase tracking-wider text-civic-green">
              Open public record →
            </span>
          </div>
        </Link>
      ) : null}

      <ul className="mt-10 grid gap-px bg-paper-border sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <li key={p.id}>
            <Link
              href={`/people/${p.slug}`}
              className="plane-link flex gap-4 bg-civic-blueSoft p-4 no-underline"
            >
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-paper font-display text-lg text-civic-blue">
                {p.photoUrl ? (
                  <Image src={p.photoUrl} alt="" fill className="object-cover" sizes="56px" />
                ) : (
                  p.photoInitials
                )}
              </div>
              <div>
                <div className="font-medium text-ink">{p.fullName}</div>
                <div className="mt-1 text-sm text-ink-faint">{p.classification}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
