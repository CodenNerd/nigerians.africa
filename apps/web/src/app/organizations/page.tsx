import { store } from "@nigeria-for-nigerians/domain";
import { PageIntro, EntityList } from "@/components/ui";

export const metadata = { title: "Organizations" };

export default function OrganizationsPage() {
  const orgs = store.allOrganizations();
  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Organizations"
        subtitle="NGOs, contractors and civic actors — vetted when they publish spend. Same public-record philosophy for funding, projects and outcomes."
        meta={`${orgs.length} organizations`}
      />
      <EntityList
        items={orgs.map((o) => {
          const vetted = o.vettingStatus === "platform_vetted";
          return {
            href: `/organizations/${o.slug}`,
            title: o.name,
            description: o.mission,
            kind: vetted ? `${o.type} · Platform vetted` : o.type,
            meta: vetted
              ? `${(o.spendLineItems ?? []).length} published spend lines`
              : undefined,
            tone: (vetted ? "green" : "slate") as "green" | "slate",
          };
        })}
      />
    </div>
  );
}
