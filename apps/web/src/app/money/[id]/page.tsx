import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { MoneyFigure, RecordPage, RecordSection, SourceList, Timeline } from "@/components/RecordPage";
import { FollowTheThread } from "@/components/FollowTheThread";

export function generateStaticParams() {
  return store.allAllocations().map((a) => ({ id: a.slug }));
}

export default async function MoneyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const allocation = store.allocationBySlug(id);
  if (!allocation) notFound();

  const budget = store.budgetById(allocation.budgetId);
  const project = allocation.projectId
    ? store.allProjects().find((p) => p.id === allocation.projectId)
    : undefined;
  const contracts = store.contractsForAllocation(allocation.id);
  const evidence = store.evidenceFor("money", allocation.id);
  const institution = budget
    ? store.allInstitutions().find((i) => i.id === budget.institutionId)
    : undefined;
  const sources = [
    allocation.sourceId ? store.sourceById(allocation.sourceId) : undefined,
    budget?.documentSourceId ? store.sourceById(budget.documentSourceId) : undefined,
    ...evidence.map((e) => store.sourceById(e.sourceId)),
  ]
    .filter(Boolean)
    .map((s) => ({ id: s!.id, title: s!.title, publisher: s!.publisher, date: s!.publicationDate }));

  return (
    <RecordPage
      eyebrow="Money"
      title={allocation.program}
      subtitle={`Recipient: ${allocation.recipient}`}
      askContext={`Where did the money go for ${allocation.program}?`}
      contributions={{ entityType: "money", entityId: allocation.id, entityTitle: allocation.program }}
      actions={[
        { label: "Submit FOI", href: "/action" },
        { label: "Challenge figures", href: "/action" },
      ]}
    >
      <RecordSection title="Trail">
        <ol className="space-y-3 font-mono text-sm">
          <li>
            <span className="text-ink-faint">Budget → </span>
            {budget ? (
              <Link href={`/money/budgets/${budget.slug}`} className="text-civic-green hover:underline">
                {budget.title}
              </Link>
            ) : (
              "—"
            )}{" "}
            ({store.formatNaira(budget?.amount ?? 0)})
          </li>
          <li>
            <span className="text-ink-faint">Institution → </span>
            {institution ? (
              <Link href={`/government/institutions/${institution.slug}`}>{institution.name}</Link>
            ) : (
              "—"
            )}
          </li>
          <li>
            <span className="text-ink-faint">Allocation → </span>
            {store.formatNaira(allocation.amount)}
          </li>
          <li>
            <span className="text-ink-faint">Release → </span>
            {allocation.released
              ? store.formatNaira(allocation.releasedAmount)
              : "No release recorded"}
          </li>
          <li>
            <span className="text-ink-faint">Contract → </span>
            {contracts.map((c) => c.title).join("; ") || "None in record"}
          </li>
          <li>
            <span className="text-ink-faint">Project → </span>
            {project ? (
              <Link href={`/projects/${project.slug}`}>{project.name}</Link>
            ) : (
              "Unlinked"
            )}
          </li>
          <li>
            <span className="text-ink-faint">Outcome → </span>
            {project ? project.status.replace(/_/g, " ") : "Unknown — record stops here"}
          </li>
        </ol>
      </RecordSection>

      <RecordSection title="Figures">
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyFigure label="Allocated" value={store.formatNaira(allocation.amount)} />
          <MoneyFigure label="Released" value={store.formatNaira(allocation.releasedAmount)} />
          <MoneyFigure
            label="Unreleased gap"
            value={store.formatNaira(Math.max(0, allocation.amount - allocation.releasedAmount))}
          />
        </div>
        {allocation.gapNote ? (
          <p className="mt-4 border border-civic-amber bg-civic-amberSoft px-4 py-3 text-sm">
            {allocation.gapNote}
          </p>
        ) : null}
      </RecordSection>

      <RecordSection title="Evidence">
        <ul className="space-y-2">
          {evidence.map((e) => (
            <li key={e.id}>
              <Link href={`/evidence/${e.id}`} className="hover:underline">
                {e.title}
              </Link>
            </li>
          ))}
        </ul>
      </RecordSection>

      <FollowTheThread
        nodes={
          project?.id === "proj-allen-spur"
            ? store.signatureThread()
            : store.related("money", allocation.id)
        }
      />

      <RecordSection title="Sources">
        <SourceList items={sources} />
      </RecordSection>
    </RecordPage>
  );
}
