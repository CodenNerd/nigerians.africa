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
        <ul className="mt-6 grid gap-px bg-paper-border">
          {budgets.map((b) => (
            <li key={b.id} id={b.id} className="scroll-mt-28 bg-civic-amberSoft p-5 sm:p-6">
              <div className="font-display text-xl text-ink sm:text-2xl">{b.title}</div>
              <p className="mt-2 text-sm text-ink-muted">{b.description}</p>
              <p className="mt-3 font-mono text-sm text-civic-amber">
                FY{b.fiscalYear} · {store.formatNaira(b.amount)} · {b.governmentLevel}
              </p>
              {b.id === "budget-fed-national-2025" || b.slug === "federal-budget-2024" ? (
                <p className="mt-2 text-sm">
                  <Link href="/people/bola-ahmed-tinubu" className="text-civic-green no-underline hover:underline">
                    Related personality: Bola Ahmed Tinubu
                  </Link>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
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
