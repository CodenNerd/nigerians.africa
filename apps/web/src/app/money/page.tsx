import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import { PageIntro, SectionHead, EntityList } from "@/components/ui";

export const metadata = { title: "Money" };

export default function MoneyPage() {
  const budgets = store.allBudgets();
  const allocations = store.allAllocations();

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Follow the money"
        subtitle="Budget → Allocation → Release → Contract → Project → Outcome. Missing information is itself visible."
        meta={`${budgets.length} budgets · ${allocations.length} allocations`}
      />

      <section className="mt-14">
        <SectionHead title="Budgets" subtitle="Fiscal envelopes, newest year first." meta={`${budgets.length}`} />
        <EntityList
          items={budgets.map((b) => {
            const institution = store.allInstitutions().find((i) => i.id === b.institutionId);
            const allocCount = store.allocationsForBudget(b.id).length;
            return {
              href: `/money/budgets/${b.slug}`,
              id: b.id,
              title: b.title,
              description: b.description,
              kind: `${b.governmentLevel} · FY${b.fiscalYear}`,
              tone: "amber" as const,
              meta: (
                <span className="font-mono text-xs">
                  {store.formatNaira(b.amount)}
                  {institution ? ` · ${institution.name}` : ""}
                  {allocCount ? ` · ${allocCount} allocation${allocCount === 1 ? "" : "s"}` : ""}
                </span>
              ),
            };
          })}
          empty="No budgets in the record yet."
        />
      </section>

      <section className="mt-16">
        <SectionHead
          title="Allocations"
          subtitle="Program trails linked to budgets — newest fiscal year first."
          meta={`${allocations.length}`}
        />
        <EntityList
          items={allocations.map((a) => ({
            href: `/money/${a.slug}`,
            title: a.program,
            description: a.gapNote,
            kind: a.recipient,
            tone: "amber" as const,
            meta: (
              <span className="font-mono text-xs">
                {store.formatNaira(a.amount)} allocated · {store.formatNaira(a.releasedAmount)} released
                {!a.released || a.releasedAmount < a.amount ? " · gap visible" : ""}
              </span>
            ),
          }))}
        />
      </section>
    </div>
  );
}
