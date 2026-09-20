import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import { StatusLabel } from "@/components/StatusLabel";
import { FollowTheThread } from "@/components/FollowTheThread";
import { RecordStream } from "@/components/RecordStream";
import { NigeriaStateMap, ProjectFeatureTiles } from "@/components/viz";
import { SectionHead, EntityList } from "@/components/ui";

export default function HomePage() {
  const problems = store.allProblems().slice(0, 3);
  const stream = store.recordStream(18);
  const allocation = store.allocationBySlug("alloc-allen-avenue-spur");
  const project = store.projectBySlug("allen-avenue-spur-rehabilitation");
  const thread = store.signatureThread();

  return (
    <div>
      <section className="hero-field relative overflow-hidden">
        {/* Map art — secondary to brand, still interactive */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[42%] items-center justify-center lg:flex xl:w-[46%]">
          <div className="pointer-events-auto w-[88%] max-w-md xl:max-w-lg">
            <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-civic-green">
              Click a state to explore
            </p>
            <NigeriaStateMap className="aspect-[1000/812] w-full drop-shadow-sm" />
          </div>
        </div>

        <div className="site-container relative z-10 py-16 sm:py-20 lg:py-24">
          <div className="max-w-xl text-center lg:max-w-xl lg:text-left">
            <div className="anim-rise">
              <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                NigeriaForNigerians
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg lg:mx-0">
                Government, problems, money and evidence — connected as one public record.
              </p>
              <form action="/search" className="mx-auto mt-10 max-w-lg lg:mx-0">
                <label htmlFor="home-search" className="sr-only">
                  Search anything about Nigeria
                </label>
                <div className="flex overflow-hidden border border-paper-border bg-paper-card/90 shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
                  <input
                    id="home-search"
                    name="q"
                    placeholder="Search the public record…"
                    className="flex-1 bg-transparent px-4 py-3.5 text-ink outline-none"
                    defaultValue="abandoned road Ikeja"
                  />
                  <button
                    type="submit"
                    className="bg-civic-green px-6 text-sm font-medium text-white transition hover:brightness-110"
                  >
                    Search
                  </button>
                </div>
              </form>
              <p
                className="anim-fade mt-5 text-sm text-ink-faint"
                style={{ animationDelay: "0.15s" }}
              >
                Signature thread:{" "}
                <Link
                  href="/projects/allen-avenue-spur-rehabilitation"
                  className="text-civic-green no-underline hover:underline"
                >
                  Allen Avenue Spur
                </Link>
                {" · "}
                <Link href="/places" className="text-civic-green no-underline hover:underline">
                  Explore places
                </Link>
              </p>
            </div>
          </div>

          {/* Mobile / tablet: full-width map under copy, still capped to hero feel */}
          <div className="anim-fade relative mt-10 w-full lg:hidden" style={{ animationDelay: "0.1s" }}>
            <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-civic-green">
              Click a state to explore
            </p>
            <NigeriaStateMap className="mx-auto aspect-[1000/812] w-full max-w-sm" />
          </div>
        </div>
      </section>

      <div className="py-14 lg:py-16">
        {/*
          Center column matches site-container (max-w-site + same gutters) so it
          lines up with the header/hero. Live stream sits in the right rail after it.
        */}
        <div className="mx-auto grid max-w-[100rem] grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,72rem)_minmax(0,1fr)] xl:gap-0">
          <div className="hidden xl:block" aria-hidden />

          <div className="min-w-0 space-y-14 px-4 sm:px-6 lg:space-y-16 lg:px-8">
            <section>
              <ProjectFeatureTiles />
            </section>

            <section>
              <SectionHead
                title="What people are facing"
                subtitle="A short cut into problems — the right-hand stream carries fuller chronology."
                meta="Latest"
              />
              <EntityList
                items={problems.map((p) => ({
                  href: `/problems/${p.slug}`,
                  title: p.title,
                  description:
                    p.description.slice(0, 100) + (p.description.length > 100 ? "…" : ""),
                  kind: p.category,
                  date: p.firstReportedAt,
                  tone: "red" as const,
                  meta: <StatusLabel status={p.verificationStatus} />,
                }))}
              />
              <p className="mt-4">
                <Link href="/problems" className="text-sm text-civic-green no-underline hover:underline">
                  All problems →
                </Link>
              </p>
            </section>

            <section>
              <SectionHead
                title="Follow the money"
                subtitle="A visible trail from allocation to project."
              />
              {allocation && project ? (
                <div className="mt-6 grid gap-px bg-paper-border lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="bg-civic-amberSoft p-6 sm:p-8">
                    <div className="space-y-2 font-mono text-sm text-civic-amber">
                      <div>{store.formatNaira(allocation.amount)} allocated</div>
                      <div className="text-ink-faint">↓</div>
                      <div className="text-ink">Lagos Ministry of Works & Infrastructure</div>
                      <div className="text-ink-faint">↓</div>
                      <div className="text-ink">Contract — Delta Roads Nigeria Ltd</div>
                      <div className="text-ink-faint">↓</div>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-civic-green no-underline hover:underline"
                      >
                        {project.name}
                      </Link>
                      <div className="text-ink-faint">↓</div>
                      <div className="text-ink">
                        Released {store.formatNaira(allocation.releasedAmount)} · Gap visible in
                        the record
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/money/${allocation.slug}`}
                    className="flex items-center justify-center bg-civic-amber px-6 py-4 font-mono text-[11px] uppercase tracking-wider text-white no-underline transition hover:brightness-110"
                  >
                    Open trail →
                  </Link>
                </div>
              ) : null}
            </section>

            <section>
              <FollowTheThread nodes={thread} title="Signature demo: abandoned road thread" />
            </section>

            <section>
              <SectionHead
                title="What can you do?"
                subtitle="Participation paths on the public record."
              />
              <ul className="mt-6 grid gap-px bg-paper-border sm:grid-cols-2">
                {[
                  {
                    href: "/report",
                    label: "Report something",
                    tone: "bg-civic-greenSoft text-civic-green",
                  },
                  {
                    href: "/government",
                    label: "Find who is responsible",
                    tone: "bg-civic-blueSoft text-civic-blue",
                  },
                  {
                    href: "/guidance",
                    label: "Learn your rights",
                    tone: "bg-civic-amberSoft text-civic-amber",
                  },
                  {
                    href: "/record",
                    label: "Browse the stream",
                    tone: "bg-civic-greenSoft text-civic-green",
                  },
                  {
                    href: "/organizations",
                    label: "Support an organization",
                    tone: "bg-civic-blueSoft text-civic-blue",
                  },
                  {
                    href: "/ask",
                    label: "Ask the public record",
                    tone: "bg-civic-amberSoft text-civic-amber",
                  },
                ].map((a) => (
                  <li key={a.label}>
                    <Link
                      href={a.href}
                      className={`plane-link block px-5 py-5 text-center font-display text-xl no-underline ${a.tone}`}
                    >
                      {a.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="min-w-0 px-4 sm:px-6 xl:justify-self-start xl:px-0 xl:pl-8 xl:pr-4">
            <div className="border border-paper-border bg-paper-card/80 p-4 sm:p-5 xl:sticky xl:top-28 xl:w-[20rem] xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto 2xl:w-[22rem]">
              <RecordStream
                items={stream}
                compact
                title="Public record"
                subtitle="Newest first. Skim here; open a row for the dossier."
                meta="Live stream"
                footerHref="/record"
                footerLabel="Full stream →"
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
