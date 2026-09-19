import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import {
  MoneyFigure,
  RecordPage,
  RecordSection,
  RelatedLinks,
  SourceList,
  Timeline,
} from "@/components/RecordPage";
import { FollowTheThread } from "@/components/FollowTheThread";
import { StatusLabel } from "@/components/StatusLabel";

export function generateStaticParams() {
  return store.allProjects().map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = store.projectBySlug(slug);
  if (!project) notFound();

  const office = store.allOffices().find((o) => o.id === project.responsibleOfficeId);
  const problem = project.problemId ? store.allProblems().find((p) => p.id === project.problemId) : undefined;
  const location = store.locations().find((l) => l.id === project.locationId);
  const allocation = store.allAllocations().find((a) => a.projectId === project.id);
  const contract = store.raw.contracts.find((c) => c.projectId === project.id);
  const evidence = [
    ...store.evidenceFor("project", project.id),
    ...(allocation ? store.evidenceFor("money", allocation.id) : []),
  ];
  const reports = store.reports().filter((r) => r.projectId === project.id);
  const responses = reports.flatMap((r) => store.responsesFor("report", r.id));
  const memory = store.memoryFor("project", project.id);
  const holder = office ? store.currentHolder(office.id) : undefined;
  const org = project.contractorId
    ? store.allOrganizations().find((o) => o.id === project.contractorId)
    : undefined;
  const handlers = store.projectHandlers(project.id);
  const budget = allocation
    ? store.allBudgets().find((b) => b.id === allocation.budgetId)
    : undefined;
  const progressPercent = store.progressForProject(project);
  const sources = evidence
    .map((e) => store.sourceById(e.sourceId))
    .filter(Boolean)
    .map((s) => ({ id: s!.id, title: s!.title, publisher: s!.publisher, date: s!.publicationDate }));

  const thread =
    project.id === "proj-allen-spur"
      ? store.signatureThread()
      : store.related("project", project.id);

  return (
    <RecordPage
      eyebrow="Project"
      title={project.name}
      subtitle={project.description}
      status={project.verificationStatus}
      meta={
        <span className="text-sm text-ink-faint">
          {location?.name} · {project.status.replace(/_/g, " ")}
        </span>
      }
      askContext={`${project.name}. What happened to this project?`}
      actions={[
        { label: "Report an update", href: "/report" },
        { label: "Follow the money", href: allocation ? `/money/${allocation.slug}` : "/money" },
        { label: "Challenge information", href: "/action" },
      ]}
    >
      <RecordSection title="Project status">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              Progress
            </p>
            <p className="mt-1 font-mono text-3xl text-civic-green">{progressPercent}%</p>
          </div>
          <div className="h-2 w-40 max-w-full bg-ink/10" aria-hidden>
            <div
              className="h-full bg-civic-green"
              style={{ width: `${Math.min(100, Math.max(4, progressPercent))}%` }}
            />
          </div>
        </div>
        {handlers.length ? (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {handlers.map((h) => {
              const tone =
                h.kind === "government"
                  ? "bg-civic-blueSoft text-civic-blue"
                  : h.kind === "business"
                    ? "bg-civic-amberSoft text-civic-amber"
                    : h.kind === "community"
                      ? "bg-paper text-civic-slate"
                      : "bg-civic-greenSoft text-civic-green";
              const kindLabel =
                h.kind === "government"
                  ? "Government"
                  : h.kind === "business"
                    ? "Business"
                    : h.kind === "community"
                      ? "Community"
                      : "NGO";
              return (
                <Link
                  key={h.kind + h.href}
                  href={h.href}
                  className={`inline-flex items-center gap-1.5 border border-transparent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider no-underline ${tone}`}
                >
                  {kindLabel}
                  <span className="font-normal normal-case tracking-normal opacity-80">
                    · {h.label.length > 36 ? h.label.slice(0, 36) + "…" : h.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 text-sm">
          {["planned", "funded", "started", "in_progress", "completed"].map((s) => {
            const reached = project.statusHistory.some((h) => h.status === s) || project.status === s;
            const current = project.status === s || (s === "in_progress" && ["delayed", "abandoned"].includes(project.status));
            return (
              <span
                key={s}
                className={`border px-2 py-1 ${current ? "border-civic-green bg-civic-greenSoft" : reached ? "border-paper-border" : "border-dashed border-paper-border text-ink-faint"}`}
              >
                {s.replace(/_/g, " ")}
              </span>
            );
          })}
          {["delayed", "abandoned"].includes(project.status) ? (
            <span className="border border-civic-red bg-civic-redSoft px-2 py-1 text-civic-red">
              {project.status}
            </span>
          ) : null}
        </div>
        <Timeline
          items={project.statusHistory.map((h) => ({
            date: h.effectiveAt,
            title: h.status.replace(/_/g, " "),
            description: h.reason,
          }))}
        />
      </RecordSection>

      <RecordSection title="Money">
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyFigure label="Approved" value={store.formatNaira(project.approvedAmount)} />
          <MoneyFigure label="Released" value={store.formatNaira(project.releasedAmount)} />
          <MoneyFigure label="Reported spend" value={store.formatNaira(project.reportedSpend)} />
        </div>
        {(budget || allocation) && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-ink-muted">
            {budget ? (
              <span className="border border-paper-border bg-paper px-3 py-1.5">
                Budget · {budget.title} ({budget.fiscalYear})
              </span>
            ) : null}
            {allocation ? (
              <Link
                href={`/money/${allocation.slug}`}
                className="border border-paper-border bg-paper px-3 py-1.5 no-underline hover:border-civic-green"
              >
                Allocation · {allocation.program}
              </Link>
            ) : null}
          </div>
        )}
        {allocation?.gapNote ? (
          <p className="mt-4 border border-civic-amber bg-civic-amberSoft px-4 py-3 text-sm text-civic-amber">
            {allocation.gapNote}
          </p>
        ) : null}
        {contract ? (
          <p className="mt-3 text-sm text-ink-muted">
            Contract: {contract.title} · {contract.contractorName} ·{" "}
            {store.formatNaira(contract.amount)} · {contract.status.replace(/_/g, " ")}
          </p>
        ) : null}
        {allocation ? (
          <Link href={`/money/${allocation.slug}`} className="mt-3 inline-block text-sm text-civic-green">
            Open full money trail →
          </Link>
        ) : null}
      </RecordSection>

      <RecordSection title="Relationships">
        <RelatedLinks
          items={[
            problem
              ? { href: `/problems/${problem.slug}`, label: problem.title, hint: "Problem addressed" }
              : null,
            office
              ? { href: `/government/offices/${office.slug}`, label: office.name, hint: "Responsible office" }
              : null,
            holder
              ? { href: `/people/${holder.slug}`, label: holder.fullName, hint: "Office holder" }
              : null,
            org
              ? { href: `/organizations/${org.slug}`, label: org.name, hint: "Contractor / organisation" }
              : null,
            location
              ? { href: `/places`, label: location.name, hint: "Location" }
              : null,
          ].filter(Boolean) as { href: string; label: string; hint?: string }[]}
        />
      </RecordSection>

      <RecordSection title="Evidence">
        <ul className="space-y-3">
          {evidence.map((e) => (
            <li key={e.id} className="border border-paper-border bg-paper-card px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/evidence/${e.id}`} className="font-medium hover:underline">
                  {e.title}
                </Link>
                <StatusLabel status={e.verificationStatus} />
              </div>
              <p className="mt-1 text-sm text-ink-muted">{e.description}</p>
            </li>
          ))}
        </ul>
      </RecordSection>

      <RecordSection id="responses" title="Citizen reports & official responses">
        {reports.map((r) => (
          <div key={r.id} className="mb-4 border border-paper-border px-4 py-3">
            <div className="font-medium">{r.title}</div>
            <p className="mt-1 text-sm text-ink-muted">{r.description}</p>
            <StatusLabel status={r.verificationStatus} className="mt-2" />
          </div>
        ))}
        {responses.map((r) => (
          <div key={r.id} className="mb-4 border border-civic-blue bg-civic-blueSoft/40 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-civic-blue">Official response</div>
            <p className="mt-2 text-sm text-ink">{r.statement}</p>
            <p className="mt-2 text-xs text-ink-faint">{r.publishedAt}</p>
          </div>
        ))}
      </RecordSection>

      <RecordSection title="History / political memory">
        <Timeline
          items={memory.map((m) => ({
            date: m.date,
            title: m.eventType,
            description: m.description,
          }))}
        />
      </RecordSection>

      <FollowTheThread nodes={thread} />

      <RecordSection title="Sources">
        <SourceList items={sources} />
      </RecordSection>
    </RecordPage>
  );
}
