import { PageIntro } from "@/components/ui";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { store } from "@nigeria-for-nigerians/domain";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  const count = store.allProjects().length;
  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Projects"
        subtitle="Filter by state, status, handlers, money and progress — scan as a list or status board. Gaps stay visible."
        meta={`${count} projects`}
      />
      <div className="mt-8">
        <ProjectsExplorer />
      </div>
    </div>
  );
}
