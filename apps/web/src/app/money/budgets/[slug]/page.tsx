import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import {
  MoneyFigure,
  RecordPage,
  RecordSection,
  RelatedLinks,
  SourceList,
} from "@/components/RecordPage";

export function generateStaticParams() {
  return store.allBudgets().map((b) => ({ slug: b.slug }));
}

export default async function BudgetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const budget = store.budgetBySlug(slug);
  if (!budget) notFound();

  const institution = store.allInstitutions().find((i) => i.id === budget.institutionId);
  const allocations = store.allocationsForBudget(budget.id);
  const allocatedTotal = allocations.reduce((s, a) => s + a.amount, 0);
  const releasedTotal = allocations.reduce((s, a) => s + a.releasedAmount, 0);

  const projects = allocations
    .map((a) => (a.projectId ? store.allProjects().find((p) => p.id === a.projectId) : undefined))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);

  const docSource = budget.documentSourceId
    ? store.sourceById(budget.documentSourceId)
    : undefined;
  const sources = [
    docSource,
    ...allocations.map((a) => (a.sourceId ? store.sourceById(a.sourceId) : undefined)),
  ]
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)
    .map((s) => ({
      id: s.id,
      title: s.title,
      publisher: s.publisher,
      date: s.publicationDate,
    }));

  // Soft personality link when seed already ties this budget to a PPP related item
  const relatedPeople = store
    .allPeople()
    .filter((p) =>
      (p.relatedItems ?? []).some(
        (r) =>
          r.href === `/money/budgets/${budget.slug}` ||
          r.href === `/money#${budget.id}` ||
          (r.kind === "Budget" && r.href.includes(budget.slug)),
      ),
    );

  return (
    <RecordPage
      eyebrow={`Budget · ${budget.governmentLevel}`}
      title={budget.title}
      subtitle={budget.description}
      askContext={`What is in the ${budget.title} envelope?`}
      meta={
        <span className="text-sm text-ink-faint">
          FY{budget.fiscalYear} · {store.formatNaira(budget.amount)}
        </span>
      }
      contributions={{ entityType: "budget", entityId: budget.id, entityTitle: budget.title }}
      actions={[
        { label: "Browse all money", href: "/money" },
        { label: "Submit FOI", href: "/action" },
      ]}
    >
      <RecordSection title="Envelope">
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyFigure label="Budget total" value={store.formatNaira(budget.amount)} />
          <MoneyFigure label="In allocations" value={store.formatNaira(allocatedTotal)} />
          <MoneyFigure label="Released so far" value={store.formatNaira(releasedTotal)} />
        </div>
        <p className="mt-4 text-sm text-ink-muted">
          Fiscal year {budget.fiscalYear} · {budget.governmentLevel} level
          {institution ? (
            <>
              {" · "}
              <Link
                href={`/government/institutions/${institution.slug}`}
                className="text-civic-green hover:underline"
              >
                {institution.name}
              </Link>
            </>
          ) : null}
        </p>
      </RecordSection>

      <RecordSection
        title="Allocations in this envelope"
        meta={`${allocations.length}`}
        subtitle="Program trails drawn from this budget — follow each to release, contract, and project."
      >
        {allocations.length === 0 ? (
          <p className="text-ink-muted">No allocations linked to this budget in the record yet.</p>
        ) : (
          <ul className="grid gap-px bg-paper-border">
            {allocations.map((a) => {
              const gap = Math.max(0, a.amount - a.releasedAmount);
              return (
                <li key={a.id}>
                  <Link
                    href={`/money/${a.slug}`}
                    className="plane-link block bg-civic-amberSoft px-4 py-4 no-underline transition hover:brightness-[0.97] sm:px-5"
                  >
                    <div className="font-display text-lg text-ink sm:text-xl">{a.program}</div>
                    <p className="mt-1 text-sm text-ink-muted">{a.recipient}</p>
                    <p className="mt-2 font-mono text-xs text-civic-amber">
                      {store.formatNaira(a.amount)} allocated · {store.formatNaira(a.releasedAmount)}{" "}
                      released
                      {gap > 0 ? ` · ${store.formatNaira(gap)} gap` : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </RecordSection>

      {projects.length > 0 ? (
        <RecordSection title="Linked projects" meta={`${projects.length}`}>
          <RelatedLinks
            items={projects.map((p) => ({
              href: `/projects/${p.slug}`,
              label: p.name,
              hint: p.status.replace(/_/g, " "),
            }))}
          />
        </RecordSection>
      ) : null}

      {relatedPeople.length > 0 ? (
        <RecordSection title="Related people">
          <RelatedLinks
            items={relatedPeople.map((p) => ({
              href: `/people/${p.slug}`,
              label: p.fullName,
              hint: p.classification ?? "Public personality",
            }))}
          />
        </RecordSection>
      ) : null}

      <RecordSection title="Sources">
        <SourceList items={sources} />
      </RecordSection>
    </RecordPage>
  );
}
