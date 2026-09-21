import { store } from "@nigeria-for-nigerians/domain";
import { StatusLabel } from "@/components/StatusLabel";
import { PageIntro, EntityList } from "@/components/ui";

export const metadata = { title: "Problems" };

export default function ProblemsPage() {
  const problems = store.allProblems();
  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Problems"
        subtitle="A living registry of problems affecting Nigeria — each connected to offices, projects, money and evidence. Newest first."
        meta={`${problems.length} problems`}
      />
      <EntityList
        items={problems.map((p) => ({
          href: `/problems/${p.slug}`,
          title: p.title,
          description: p.description,
          kind: p.category,
          date: p.firstReportedAt,
          tone: "red" as const,
          imageUrl: p.coverUrl,
          meta: <StatusLabel status={p.verificationStatus} />,
        }))}
      />
    </div>
  );
}
