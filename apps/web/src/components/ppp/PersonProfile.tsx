import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import type { Allocation, Office, OfficeTenure, Person, Project } from "@nigeria-for-nigerians/domain";
import { PersonHero } from "./PersonHero";
import { ProfileGuideNav } from "./ProfileGuideNav";
import { RecordGlance } from "./RecordGlance";
import { TenureTimeline } from "./TenureTimeline";
import { ClaimStatusStrip } from "./ClaimStatusStrip";
import { RelatedRecords } from "./RelatedRecords";
import { MemorySpine } from "./MemorySpine";
import { AskPanel } from "@/components/AskPanel";
import { WhatCanYouDo } from "@/components/WhatCanYouDo";
import { SourceList } from "@/components/RecordPage";
import { FollowTheThread } from "@/components/FollowTheThread";
import { SectionHead } from "./visual";
import { seedFollowBase } from "@/lib/follow/seed-counts";

function ProjectsViz({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="scroll-mt-28">
      <SectionHead
        title="Projects"
        subtitle="Linked through office responsibility or federal oversight."
        meta={`${projects.length} projects`}
      />
      {projects.length === 0 ? (
        <p className="mt-6 text-ink-muted">No linked projects in this record yet.</p>
      ) : (
        <div className="mt-6 grid gap-px bg-paper-border">
          {projects.map((p) => {
            const releasedPct =
              p.approvedAmount > 0 ? Math.round((p.releasedAmount / p.approvedAmount) * 100) : 0;
            return (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="group block bg-civic-greenSoft p-6 no-underline transition hover:brightness-[0.97] sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-civic-green">
                    Project · {p.status.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-xs text-ink-faint opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </div>
                <h3 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
                  {p.name}
                </h3>
                <p className="mt-3 max-w-2xl text-sm text-ink-muted">{p.description}</p>

                <svg viewBox="0 0 320 36" className="mt-6 h-9 w-full max-w-md text-civic-green" aria-hidden>
                  <text x="0" y="12" fill="currentColor" style={{ fontSize: 9, fontFamily: "ui-monospace" }}>
                    APPROVED {store.formatNaira(p.approvedAmount)}
                  </text>
                  <rect x="0" y="18" width="320" height="10" fill="currentColor" opacity="0.2" />
                  <rect
                    x="0"
                    y="18"
                    width={Math.max(8, (releasedPct / 100) * 320)}
                    height="10"
                    fill="currentColor"
                    opacity="0.9"
                  />
                </svg>
                <p className="mt-2 font-mono text-sm text-civic-green">
                  {store.formatNaira(p.releasedAmount)} released · {releasedPct}% of approved
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MoneyViz({ allocations }: { allocations: Allocation[] }) {
  return (
    <section id="money" className="scroll-mt-28">
      <SectionHead
        title="Public money"
        subtitle="Budget and allocation records connected to this personality’s responsibilities."
        meta={`${allocations.length} trails`}
      />
      {allocations.length === 0 ? (
        <p className="mt-6 text-ink-muted">No money trail linked yet.</p>
      ) : (
        <div className="mt-6 grid gap-px bg-paper-border lg:grid-cols-1">
          {allocations.map((a) => {
            const gap = Math.max(0, a.amount - a.releasedAmount);
            const releasedPct = a.amount > 0 ? Math.round((a.releasedAmount / a.amount) * 100) : 0;
            return (
              <Link
                key={a.id}
                href={`/money/${a.slug}`}
                className="group block bg-civic-amberSoft p-6 no-underline transition hover:brightness-[0.97] sm:p-8"
              >
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-civic-amber">
                  Money trail
                </span>
                <h3 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">
                  {a.program}
                </h3>

                <svg viewBox="0 0 360 70" className="mt-6 h-16 w-full max-w-lg text-civic-amber" aria-hidden>
                  <text x="0" y="14" fill="currentColor" style={{ fontSize: 9, fontFamily: "ui-monospace" }}>
                    ALLOCATED → RELEASED → GAP
                  </text>
                  <rect x="0" y="28" width={Math.max(20, releasedPct * 2.4)} height="12" fill="currentColor" />
                  <rect
                    x={Math.max(20, releasedPct * 2.4)}
                    y="28"
                    width={Math.max(20, (100 - releasedPct) * 2.4)}
                    height="12"
                    fill="currentColor"
                    opacity="0.25"
                  />
                  <path
                    d="M40 52 L40 60 L160 60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M200 52 L200 60 L320 60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                </svg>

                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm">
                  <span className="text-civic-amber">{store.formatNaira(a.amount)} allocated</span>
                  <span className="text-ink">{store.formatNaira(a.releasedAmount)} released</span>
                  {gap > 0 ? (
                    <span className="text-ink-faint">{store.formatNaira(gap)} unreleased</span>
                  ) : null}
                </div>
                {a.gapNote ? <p className="mt-3 max-w-2xl text-sm text-ink-muted">{a.gapNote}</p> : null}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CandidaciesViz({
  candidacies,
}: {
  candidacies: ReturnType<typeof store.candidaciesForPerson>;
}) {
  if (candidacies.length === 0) return null;

  return (
    <section id="candidacies" className="scroll-mt-28">
      <SectionHead
        title="Political candidacies"
        subtitle="Declared and contested races linked to this person on the public record."
        meta={`${candidacies.length} candidac${candidacies.length === 1 ? "y" : "ies"}`}
      />
      <ul className="mt-6 grid gap-px bg-paper-border">
        {candidacies.map((c) => {
          const election = store.events().find((e) => e.id === c.electionId);
          const office = c.officeId
            ? store.allOffices().find((o) => o.id === c.officeId)
            : undefined;
          return (
            <li key={c.id}>
              <Link
                href={`/candidates/${c.slug}`}
                className="group block bg-civic-blueSoft p-6 no-underline transition hover:brightness-[0.97] sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-civic-blue">
                    {c.party} · {c.status.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-xs text-ink-faint opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl leading-tight text-ink sm:text-3xl">
                  {c.ballotName ?? "Candidacy"}
                </h3>
                <p className="mt-3 text-sm text-ink-muted">
                  {office ? office.title : "Office not yet recorded"}
                  {election ? ` · ${election.title}` : null}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-ink-faint">
        Browse all candidacies in the{" "}
        <Link href="/candidates" className="text-civic-green hover:underline">
          candidates archive
        </Link>
        .
      </p>
    </section>
  );
}

export function PersonProfile({ person }: { person: Person }) {
  const tenures = store.tenuresForPerson(person.id);
  const tenureItems: { tenure: OfficeTenure; office: Office }[] = [];
  for (const t of tenures) {
    const office = store.allOffices().find((o) => o.id === t.officeId);
    if (office) tenureItems.push({ tenure: t, office });
  }

  const currentTenure = tenures.find((t) => !t.endDate);
  const currentOffice = currentTenure
    ? store.allOffices().find((o) => o.id === currentTenure.officeId)
    : undefined;

  const candidacies = store.candidaciesForPerson(person.id);
  const isCandidate = store.isPoliticalCandidate(person.id);

  const claims = store.claimsForPerson(person.id);
  const memory = store.memoryFor("person", person.id);
  const evidence = store.evidenceFor("person", person.id);
  const related = store.related("person", person.id);

  const projectIds = new Set(related.filter((r) => r.type === "project").map((r) => r.id));
  for (const t of tenures) {
    for (const p of store.allProjects()) {
      if (p.responsibleOfficeId === t.officeId) projectIds.add(p.id);
    }
  }
  const projects = store.allProjects().filter((p) => projectIds.has(p.id));

  const allocations = related
    .filter((r) => r.type === "money")
    .map((m) => store.allAllocations().find((a) => a.id === m.id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const sources = [
    ...evidence.map((e) => store.sourceById(e.sourceId)),
    ...claims.flatMap((c) =>
      c.evidenceIds.map((id) => {
        const ev = store.evidenceById(id);
        return ev ? store.sourceById(ev.sourceId) : undefined;
      }),
    ),
    ...tenures.map((t) => (t.sourceId ? store.sourceById(t.sourceId) : undefined)),
  ]
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)
    .map((s) => ({
      id: s.id,
      title: s.title,
      publisher: s.publisher,
      date: s.publicationDate,
    }));

  return (
    <article>
      <PersonHero
        person={person}
        currentOffice={currentOffice}
        isPoliticalCandidate={isCandidate}
        followCount={seedFollowBase("person", person.id)}
      />
      <ProfileGuideNav showCandidacies={isCandidate} />

      <div className="site-container py-10 lg:py-14">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_16.5rem] lg:gap-14">
          <div className="space-y-20">
            <RecordGlance claims={claims} />
            <TenureTimeline items={tenureItems} />
            <CandidaciesViz candidacies={candidacies} />
            <MemorySpine events={memory} />
            <ClaimStatusStrip claims={claims} />
            <ProjectsViz projects={projects} />
            <MoneyViz allocations={allocations} />
            <RelatedRecords items={person.relatedItems ?? []} />
            {related.length > 0 ? <FollowTheThread nodes={related} /> : null}

            <section id="sources" className="scroll-mt-28">
              <SectionHead
                title="Sources"
                subtitle="Provenance for entries in this Public Personality Profile."
                meta={`${sources.length} sources`}
              />
              <div className="mt-6">
                <SourceList items={sources} />
              </div>
            </section>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-36 lg:self-start">
            <AskPanel context={`Public Personality Profile: ${person.fullName}`} />
            <WhatCanYouDo
              follow={{
                entityType: "person",
                entityId: person.id,
                entityTitle: person.fullName,
              }}
              actions={[
                { label: "View sources", href: "#sources" },
                { label: "Report an issue", href: "/report" },
                { label: "Find who is responsible", href: "/government" },
                ...(isCandidate
                  ? [{ label: "All candidacies", href: "/candidates" }]
                  : []),
              ]}
            />
          </aside>
        </div>
      </div>
    </article>
  );
}
