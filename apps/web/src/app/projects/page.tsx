import { store } from "@nigeria-for-nigerians/domain";
import { StatusLabel } from "@/components/StatusLabel";
import { PageIntro, EntityList } from "@/components/ui";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  const projects = store.allProjects();
  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Projects"
        subtitle="Public projects with status history, funding and evidence — including visible gaps. Newest activity first."
        meta={`${projects.length} projects`}
      />
      <EntityList
        items={projects.map((p) => ({
          href: `/projects/${p.slug}`,
          title: p.name,
          description: p.description,
          kind: p.status.replace(/_/g, " "),
          date: p.startDate,
          tone: "green" as const,
          meta: (
            <span className="font-mono text-xs">
              {store.formatNaira(p.approvedAmount)} approved · {store.formatNaira(p.releasedAmount)}{" "}
              released · <StatusLabel status={p.verificationStatus} />
            </span>
          ),
        }))}
      />
    </div>
  );
}
