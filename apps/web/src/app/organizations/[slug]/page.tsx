import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { MoneyFigure, RecordPage, RecordSection, RelatedLinks } from "@/components/RecordPage";

export function generateStaticParams() {
  return store.allOrganizations().map((o) => ({ slug: o.slug }));
}

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = store.organizationBySlug(slug);
  if (!org) notFound();

  const problems = store.allProblems().filter((p) => org.problemIds.includes(p.id));
  const projects = store.allProjects().filter((p) => org.projectIds.includes(p.id));
  const location = store.locations().find((l) => l.id === org.locationId);
  const vetted = org.vettingStatus === "platform_vetted";
  const spendLines = org.spendLineItems ?? [];

  return (
    <RecordPage
      eyebrow={`Organization · ${org.type}`}
      title={org.name}
      subtitle={org.mission}
      askContext={org.name}
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
        {location ? <p className="mt-1 text-sm text-ink-faint">Based in {location.name}</p> : null}
        <p className="mt-3 text-sm">
          Status:{" "}
          <span className={vetted ? "font-medium text-civic-green" : "text-ink-muted"}>
            {vetted ? "Platform vetted" : "Not yet vetted"}
          </span>
        </p>
      </RecordSection>

      <RecordSection title="Working on">
        <RelatedLinks
          items={[
            ...problems.map((p) => ({
              href: `/problems/${p.slug}`,
              label: p.title,
              hint: "Problem",
            })),
            ...projects.map((p) => ({
              href: `/projects/${p.slug}`,
              label: p.name,
              hint: "Project",
            })),
          ]}
        />
      </RecordSection>

      <RecordSection title="Funding">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyFigure label="Received" value={store.formatNaira(org.fundingReceived)} />
          <MoneyFigure label="Spent" value={store.formatNaira(org.fundingSpent)} />
        </div>
      </RecordSection>

      {spendLines.length > 0 ? (
        <RecordSection title="Published spend">
          <p className="mb-4 text-sm text-ink-muted">
            Line items published by the organization. Citizens and donors can inspect where money
            went — required to earn the vetted badge.
          </p>
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
            </table>
          </div>
        </RecordSection>
      ) : null}

      <RecordSection title="Transparency">
        <p className="prose-record">{org.transparencyNotes}</p>
      </RecordSection>
    </RecordPage>
  );
}
