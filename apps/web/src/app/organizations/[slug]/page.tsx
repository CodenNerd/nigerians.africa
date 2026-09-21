import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FUNDING_STATUS_LABEL,
  store,
  type FundingStatus,
  type OrgProjectRole,
} from "@nigeria-for-nigerians/domain";
import { MoneyFigure, RecordPage, RecordSection, RelatedLinks } from "@/components/RecordPage";
import { OrganizationPeople } from "@/components/OrganizationPeople";

export function generateStaticParams() {
  return store.allOrganizations().map((o) => ({ slug: o.slug }));
}

const ROLE_LABEL: Record<OrgProjectRole, string> = {
  contractor: "Contractor",
  implementer: "Implementer",
  funder: "Funder",
  campaign_host: "Campaign host",
};

const FUNDING_TONE: Record<FundingStatus, string> = {
  fully_funded: "border-civic-green bg-civic-greenSoft text-civic-green",
  partially_funded: "border-civic-amber bg-civic-amberSoft text-civic-amber",
  unfunded: "border-paper-border bg-paper text-ink-faint",
};

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = store.organizationBySlug(slug);
  if (!org) notFound();

  const problems = store.allProblems().filter((p) => org.problemIds.includes(p.id));
  const projectLinks = store.projectsForOrganization(org.id);
  const people = store.peopleForOrganization(org.id);
  const location = store.locations().find((l) => l.id === org.locationId);
  const vetted = org.vettingStatus === "platform_vetted";
  const spendLines = org.spendLineItems ?? [];
  const prosecutingMatters = store.mattersForOrganization(org.id);
  const mnbScheme = store.schemeBySlug("make-nigeria-better");

  return (
    <RecordPage
      eyebrow={`Organization · ${org.type}`}
      title={org.name}
      subtitle={org.mission}
      askContext={org.name}
      avatarUrl={org.logoUrl}
      actions={[
        { label: "Support / volunteer", href: "/action" },
        { label: "Contact via report", href: "/report" },
      ]}
    >
      {vetted ? (
        <div className="mb-8 border border-civic-green bg-civic-greenSoft px-4 py-3 text-sm text-civic-green">
          Platform vetted — this organization publishes spending lines to earn trust. Vetting is
          transparency process, not an endorsement of every outcome.
        </div>
      ) : null}

      <RecordSection title="About">
        <p className="prose-record">{org.description}</p>
        {org.registrationNumber ? (
          <p className="mt-3 text-sm text-ink-faint">Registration: {org.registrationNumber}</p>
        ) : null}
        {org.website ? (
          <p className="mt-1 text-sm">
            <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-civic-green">
              Website (external)
            </a>
          </p>
        ) : null}
        {location ? <p className="mt-1 text-sm text-ink-faint">Based in {location.name}</p> : null}
        <p className="mt-3 text-sm">
          Status:{" "}
          <span className={vetted ? "font-medium text-civic-green" : "text-ink-muted"}>
            {vetted ? "Platform vetted" : "Not yet vetted"}
          </span>
        </p>
        {(org.ngoCategories ?? []).length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {(org.ngoCategories ?? []).map((id) => {
              const cat = store.ngoCategoryMeta(id);
              if (!cat) return null;
              return (
                <Link
                  key={id}
                  href={`/organizations/ngos/${id}`}
                  className="border border-civic-green/30 bg-civic-greenSoft/60 px-2.5 py-1 text-xs text-civic-green no-underline transition hover:border-civic-green/50"
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </RecordSection>

      <RecordSection
        title="People"
        subtitle="Staff, directors and counsel linked to this organization on the public record."
        meta={`${people.length} people`}
      >
        <OrganizationPeople people={people} />
      </RecordSection>

      <RecordSection title="Projects">
        {projectLinks.length === 0 ? (
          <p className="text-sm text-ink-muted">No linked projects in the public record yet.</p>
        ) : (
          <ul className="divide-y divide-paper-border border border-paper-border">
            {projectLinks.map(({ project, roles, fundingStatus, fundingPercent }) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="plane-link block px-4 py-4 no-underline hover:bg-paper"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                      {project.status.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${FUNDING_TONE[fundingStatus]}`}
                    >
                      {FUNDING_STATUS_LABEL[fundingStatus]}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-xl text-ink sm:text-2xl">{project.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{project.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="border border-paper-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-faint"
                      >
                        {ROLE_LABEL[role]}
                      </span>
                    ))}
                    <span className="font-mono text-[11px] text-ink-faint">
                      {fundingPercent}% funded
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </RecordSection>

      {prosecutingMatters.length > 0 && mnbScheme ? (
        <RecordSection title="Prosecuting under Make Nigeria Better">
          <p className="mb-4 text-sm text-ink-muted">
            Matters this organization holds under{" "}
            <Link
              href={`/schemes/${mnbScheme.slug}`}
              className="text-civic-green hover:underline"
            >
              {mnbScheme.name}
            </Link>
            . Status describes process — not a guilt verdict.
          </p>
          <RelatedLinks
            items={prosecutingMatters.map((m) => ({
              href: `/schemes/${mnbScheme.slug}/${m.slug}`,
              label: m.title,
              hint: m.status.replace(/_/g, " "),
            }))}
          />
        </RecordSection>
      ) : null}

      {problems.length > 0 ? (
        <RecordSection title="Problems">
          <RelatedLinks
            items={problems.map((p) => ({
              href: `/problems/${p.slug}`,
              label: p.title,
              hint: "Problem",
            }))}
          />
        </RecordSection>
      ) : null}

      <RecordSection title="Organisation funding">
        <p className="mb-3 text-sm text-ink-muted">
          Programme-level money received and spent by this organisation — distinct from per-project
          ledgers on each project dossier. Open Received or Spent to see the breakdown.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyFigure
            label="Received"
            value={store.formatNaira(org.fundingReceived)}
            href="#funding-received"
            hint="How was the money made? →"
            tone="amber"
          />
          <MoneyFigure
            label="Spent"
            value={store.formatNaira(org.fundingSpent)}
            href="#funding-spent"
            hint="How was it spent? →"
            tone="amber"
          />
          <MoneyFigure
            label="Still to spend"
            value={store.formatNaira(Math.max(0, org.fundingReceived - org.fundingSpent))}
            href="#funding-projects"
            hint="Remaining & project allocations →"
            tone="green"
          />
        </div>
      </RecordSection>

      <RecordSection
        id="funding-received"
        title="How money was received"
        subtitle="Income lines published for this organisation — grants, dues, contracts and donations."
        meta={`${(org.incomeLineItems ?? []).length} lines`}
      >
        {(org.incomeLineItems ?? []).length === 0 ? (
          <p className="text-sm text-ink-muted">No income lines published yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-paper-border text-left text-xs uppercase tracking-wider text-ink-faint">
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Period</th>
                  <th className="py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(org.incomeLineItems ?? []).map((line, i) => (
                  <tr key={`${line.label}-${i}`} className="border-b border-paper-border">
                    <td className="py-3 pr-4 font-medium text-ink">{line.label}</td>
                    <td className="py-3 pr-4 font-mono text-ink-muted">{line.period}</td>
                    <td className="py-3 font-mono">{store.formatNaira(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-paper-border">
                  <td className="py-3 pr-4 font-medium text-ink" colSpan={2}>
                    Total received
                  </td>
                  <td className="py-3 font-mono font-medium text-civic-amber">
                    {store.formatNaira(org.fundingReceived)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </RecordSection>

      <RecordSection
        id="funding-spent"
        title="How money was spent"
        subtitle="Published spend lines — where programme money went on the public record."
        meta={`${spendLines.length} lines`}
      >
        {spendLines.length === 0 ? (
          <p className="text-sm text-ink-muted">No spend lines published yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-paper-border text-left text-xs uppercase tracking-wider text-ink-faint">
                  <th className="py-2 pr-4">Line</th>
                  <th className="py-2 pr-4">Period</th>
                  <th className="py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {spendLines.map((line, i) => (
                  <tr key={`${line.label}-${i}`} className="border-b border-paper-border">
                    <td className="py-3 pr-4 font-medium text-ink">{line.label}</td>
                    <td className="py-3 pr-4 font-mono text-ink-muted">{line.period}</td>
                    <td className="py-3 font-mono">{store.formatNaira(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-paper-border">
                  <td className="py-3 pr-4 font-medium text-ink" colSpan={2}>
                    Total spent
                  </td>
                  <td className="py-3 font-mono font-medium text-civic-amber">
                    {store.formatNaira(org.fundingSpent)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </RecordSection>

      <RecordSection
        id="funding-projects"
        title="Allocated to projects"
        subtitle="Organisation funds earmarked or paid toward linked projects — and what remains unallocated."
        meta={`${(org.projectAllocations ?? []).length} projects`}
      >
        {(() => {
          const allocations = org.projectAllocations ?? [];
          const allocatedTotal = allocations.reduce((sum, a) => sum + a.amount, 0);
          const remaining = Math.max(0, org.fundingReceived - org.fundingSpent);
          const unallocated = Math.max(0, org.fundingReceived - allocatedTotal);

          if (!allocations.length) {
            return (
              <div className="space-y-3">
                <p className="text-sm text-ink-muted">
                  No project allocations published yet. Remaining to spend:{" "}
                  <span className="font-mono text-civic-green">{store.formatNaira(remaining)}</span>.
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <MoneyFigure
                  label="Allocated to projects"
                  value={store.formatNaira(allocatedTotal)}
                  tone="blue"
                />
                <MoneyFigure
                  label="Still to spend"
                  value={store.formatNaira(remaining)}
                  tone="green"
                  hint={
                    unallocated > 0
                      ? `${store.formatNaira(unallocated)} of received not yet tied to a project line`
                      : "All received funds appear on project lines"
                  }
                />
              </div>
              <ul className="grid gap-px bg-paper-border">
                {allocations.map((row) => {
                  const project = store.allProjects().find((p) => p.id === row.projectId);
                  if (!project) return null;
                  return (
                    <li key={row.projectId}>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="plane-link block bg-civic-blueSoft px-5 py-4 no-underline"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-civic-blue">
                              Project allocation
                            </p>
                            <p className="mt-1 font-display text-xl text-ink">{project.name}</p>
                            {row.note ? (
                              <p className="mt-1 text-sm text-ink-muted">{row.note}</p>
                            ) : null}
                          </div>
                          <p className="shrink-0 font-mono text-base text-civic-blue">
                            {store.formatNaira(row.amount)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}
      </RecordSection>

      <RecordSection title="Transparency">
        <p className="prose-record">{org.transparencyNotes}</p>
      </RecordSection>
    </RecordPage>
  );
}
