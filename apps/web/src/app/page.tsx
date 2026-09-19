import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import { StatusLabel } from "@/components/StatusLabel";
import { PlacesMap } from "@/components/PlacesMap";
import { FollowTheThread } from "@/components/FollowTheThread";
import { RecordStream } from "@/components/RecordStream";
import { SectionHead, EntityList } from "@/components/ui";
import { buildGodsEyePoints } from "@/lib/gods-eye-points";

export default function HomePage() {
  const problems = store.allProblems().slice(0, 3);
  const stream = store.recordStream(24);
  const allocation = store.allocationBySlug("alloc-allen-avenue-spur");
  const project = store.projectBySlug("allen-avenue-spur-rehabilitation");
  const thread = store.signatureThread();
  const states = store.locations().filter((l) => l.type === "state");
  const mapPoints = buildGodsEyePoints();

  return (
    <div>
      <section className="hero-field">
        <div className="site-container anim-rise py-20 text-center sm:py-24 lg:py-28">
          <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            NigeriaForNigerians
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Government, problems, money and evidence — connected as one public record.
          </p>
          <form action="/search" className="mx-auto mt-10 max-w-lg">
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
          <p className="anim-fade mt-5 text-sm text-ink-faint" style={{ animationDelay: "0.15s" }}>
            Signature thread:{" "}
            <Link
              href="/projects/allen-avenue-spur-rehabilitation"
              className="text-civic-green no-underline hover:underline"
            >
              Allen Avenue Spur
            </Link>
          </p>
        </div>
      </section>

      <section className="site-container py-14 lg:py-16">
        <RecordStream
          items={stream}
          title="Public record"
          subtitle="A dense stream of meaningful records — newest first. Skim kind, date and title; open any row for the archive dossier."
          meta={`${stream.length} shown`}
          footerHref="/record"
          footerLabel="View full stream →"
        />
      </section>

      <section className="site-container py-14 lg:py-16">
        <SectionHead
          title="The Country"
          subtitle="Explore Nigeria by place, problem, project, report and office."
          meta={`${states.length} states`}
        />
        <div className="mt-6">
          <PlacesMap points={mapPoints} showLayers />
        </div>
        <ul className="mt-5 flex flex-wrap gap-px bg-paper-border">
          {states.slice(0, 12).map((s) => (
            <li key={s.id}>
              <Link
                href={`/places/states/${s.slug}`}
                className="block bg-civic-greenSoft px-3 py-1.5 text-sm text-civic-green no-underline transition hover:brightness-[0.97]"
              >
                {s.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/places"
              className="block bg-paper-card px-3 py-1.5 text-sm text-ink-muted no-underline hover:text-civic-green"
            >
              All places →
            </Link>
          </li>
        </ul>
      </section>

      <section className="site-container py-10 lg:py-12">
        <SectionHead
          title="What people are facing"
          subtitle="A short cut into problems — the stream above carries fuller chronology."
          meta="Latest"
        />
        <EntityList
          items={problems.map((p) => ({
            href: `/problems/${p.slug}`,
            title: p.title,
            description: p.description.slice(0, 100) + (p.description.length > 100 ? "…" : ""),
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

      <section className="site-container py-14 lg:py-16">
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
                <Link href={`/projects/${project.slug}`} className="text-civic-green no-underline hover:underline">
                  {project.name}
                </Link>
                <div className="text-ink-faint">↓</div>
                <div className="text-ink">
                  Released {store.formatNaira(allocation.releasedAmount)} · Gap visible in the record
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

      <section className="site-container py-14 lg:py-16">
        <FollowTheThread nodes={thread} title="Signature demo: abandoned road thread" />
      </section>

      <section className="site-container py-14 lg:py-16">
        <SectionHead title="What can you do?" subtitle="Participation paths on the public record." />
        <ul className="mt-6 grid gap-px bg-paper-border sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/report", label: "Report something", tone: "bg-civic-greenSoft text-civic-green" },
            { href: "/government", label: "Find who is responsible", tone: "bg-civic-blueSoft text-civic-blue" },
            { href: "/guidance", label: "Learn your rights", tone: "bg-civic-amberSoft text-civic-amber" },
            { href: "/record", label: "Browse the stream", tone: "bg-civic-greenSoft text-civic-green" },
            { href: "/organizations", label: "Support an organization", tone: "bg-civic-blueSoft text-civic-blue" },
            { href: "/ask", label: "Ask the public record", tone: "bg-civic-amberSoft text-civic-amber" },
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
  );
}
