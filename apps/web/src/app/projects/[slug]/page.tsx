import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import {
  RecordPage,
  RecordSection,
  RelatedLinks,
  SourceList,
  Timeline,
} from "@/components/RecordPage";
import { FollowTheThread } from "@/components/FollowTheThread";
import { StatusLabel } from "@/components/StatusLabel";
import {
  EvidenceMediaGallery,
  FlowStrip,
  FundingRequest,
  MoneyComposition,
  ProjectCover,
  ProjectGlance,
  WorkJourney,
} from "@/components/viz";

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
  const problemEvidence =
    project.problemId && project.locationId
      ? store
          .evidenceFor("problem", project.problemId)
          .filter((e) => !e.locationId || e.locationId === project.locationId)
      : [];
  const mediaEvidence = [...evidence, ...problemEvidence].filter(
    (e, i, arr) => arr.findIndex((x) => x.id === e.id) === i,
  );
  const reports = store.reports().filter((r) => r.projectId === project.id);
  const responses = reports.flatMap((r) => store.responsesFor("report", r.id));
  const memory = store.memoryFor("project", project.id);
  const holder = office ? store.currentHolder(office.id) : undefined;
  const org = project.contractorId
    ? store.allOrganizations().find((o) => o.id === project.contractorId)
    : undefined;
  const handlers = store.projectHandlers(project.id);
  const funding = store.fundingForProject(project.id);
  const progressPercent = store.progressForProject(project);
  const recordTimeline = store.projectRecordTimeline(project.id);

  const unreleased = Math.max(0, funding.budgetTarget - funding.receivedTotal);
  const unspent = Math.max(0, funding.receivedTotal - funding.spendTotal);
  const gapLabel =
    unreleased > funding.budgetTarget * 0.05
      ? `${store.formatNaira(unreleased)} still unreleased vs budget`
      : unspent > funding.receivedTotal * 0.05 && funding.receivedTotal > 0
        ? `${store.formatNaira(unspent)} received but not yet recorded as spent`
        : undefined;

  const summaryLine = `${progressPercent}% work · ${funding.fundingPercent}% funded`;
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
      hideHeader
      hero={
        <ProjectCover
          title={project.name}
          coverUrl={project.coverUrl}
          coverCredit={project.coverCredit}
          locationName={location?.name}
          workStatus={project.status}
          verificationLabel={project.verificationStatus.replace(/_/g, " ")}
        />
      }
    >
      {project.description ? (
        <p className="anim-fade max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {project.description}
        </p>
      ) : null}

      <ProjectGlance
        workPercent={progressPercent}
        fundingPercent={funding.fundingPercent}
        fundingStatus={funding.fundingStatus}
        locationName={location?.name}
        workStatus={project.status}
        handlers={handlers}
        gapLabel={gapLabel}
        summaryLine={summaryLine}
        campaignPlatform={funding.campaigns[0]?.platform}
      />

      <RecordSection
        title="Field media"
        subtitle="Citizen and official photos and video attached to this project."
        meta={`${mediaEvidence.filter((e) => e.mediaKind === "image" || e.mediaKind === "video").length} items`}
      >
        <EvidenceMediaGallery items={mediaEvidence} />
      </RecordSection>

      <RecordSection
        title="Work progress"
        subtitle="Where the project sits on the delivery path — funding is tracked separately below."
      >
        <WorkJourney status={project.status} statusHistory={project.statusHistory} />
      </RecordSection>

      <RecordSection
        title="Record timeline"
        subtitle="Work status, funding, spend, evidence, reports and memory — newest first."
        meta={`${recordTimeline.length} events`}
      >
        <Timeline
          items={recordTimeline.map((e) => ({
            date: e.date,
            title: e.title,
            description: e.description,
            kind: e.kind,
            href: e.href,
          }))}
        />
      </RecordSection>

      {funding.campaigns.length > 0 ? (
        <section id="funding-request" className="scroll-mt-28">
          <RecordSection
            title="Funding request"
            subtitle="Public donation or community ask linked to this project."
          >
            <FundingRequest campaigns={funding.campaigns} />
          </RecordSection>
        </section>
      ) : null}

      <RecordSection
        title="Budget & funding"
        subtitle="How much was meant to arrive, what landed, and what was spent."
      >
        <MoneyComposition
          budgetTarget={funding.budgetTarget}
          receivedTotal={funding.receivedTotal}
          spendTotal={funding.spendTotal}
          fundingStatus={funding.fundingStatus}
          fundingPercent={funding.fundingPercent}
          sources={funding.sources}
          summary={project.fundingSummary ?? project.fundingSource}
        />

        {funding.sources.length > 0 ? (
          <div className="mt-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              Funding sources
            </p>
            <ul className="mt-2 space-y-2">
              {funding.sources.map((fs) => {
                const alloc = fs.allocationId
                  ? store.allAllocations().find((a) => a.id === fs.allocationId)
                  : undefined;
                const funderOrg = fs.organizationId
                  ? store.allOrganizations().find((o) => o.id === fs.organizationId)
                  : undefined;
                return (
                  <li
                    key={fs.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 border border-paper-border bg-paper px-3 py-2.5 text-sm"
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-ink-faint">
                        {fs.kind.replace(/_/g, " ")}
                      </span>
                      <div className="font-medium text-ink">{fs.label}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-muted">
                        {alloc ? (
                          <Link href={`/money/${alloc.slug}`} className="text-civic-green">
                            Allocation →
                          </Link>
                        ) : null}
                        {funderOrg ? (
                          <Link href={`/organizations/${funderOrg.slug}`} className="text-civic-green">
                            {funderOrg.name}
                          </Link>
                        ) : null}
                      </div>
                      {fs.notes ? <p className="mt-1 text-xs text-ink-faint">{fs.notes}</p> : null}
                    </div>
                    <div className="font-mono text-xs text-ink-muted">
                      {store.formatNaira(fs.receivedAmount)} / {store.formatNaira(fs.pledgedAmount)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

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

      <RecordSection title="Income stream" subtitle="Money arriving — releases, grants, donations.">
        <FlowStrip
          barTone="amber"
          emptyLabel="No income events recorded yet."
          items={funding.inflows.map((row) => ({
            id: row.id,
            date: row.receivedAt,
            title: row.payerLabel,
            subtitle: (
              <>
                {row.channel.replace(/_/g, " ")}
                {row.sourceId ? " · linked source" : ""}
              </>
            ),
            amount: row.amount,
            meta: <StatusLabel status={row.verificationStatus} />,
          }))}
        />
      </RecordSection>

      <RecordSection title="Spend record" subtitle="Where money went — materials, labour, contractors.">
        <FlowStrip
          barTone="green"
          emptyLabel="No spend lines recorded yet."
          items={funding.spends.map((row) => {
            const payeeOrg = row.organizationId
              ? store.allOrganizations().find((o) => o.id === row.organizationId)
              : undefined;
            return {
              id: row.id,
              date: row.spentAt,
              title: row.payeeLabel,
              subtitle: (
                <>
                  {row.category}
                  {payeeOrg ? (
                    <>
                      {" · "}
                      <Link href={`/organizations/${payeeOrg.slug}`} className="text-civic-green">
                        {payeeOrg.name}
                      </Link>
                    </>
                  ) : null}
                </>
              ),
              notes: row.notes,
              amount: row.amount,
              meta: <StatusLabel status={row.verificationStatus} />,
            };
          })}
        />
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
