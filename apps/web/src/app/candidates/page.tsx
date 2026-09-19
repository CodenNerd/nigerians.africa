import { store } from "@nigeria-for-nigerians/domain";
import { PageIntro, EntityList } from "@/components/ui";

export const metadata = { title: "Candidates" };

export default function CandidatesPage() {
  const candidacies = store.allPoliticalCandidates();

  return (
    <div className="site-container py-12 lg:py-14">
      <PageIntro
        eyebrow="Public record"
        title="Candidates"
        subtitle="Candidacy records linked to people and elections — not a separate product surface. Open a person or election for full context."
        meta={`${candidacies.length} candidacies`}
      />
      <EntityList
        items={candidacies.map((c) => {
          const person = store.allPeople().find((p) => p.id === c.personId);
          const election = store.events().find((e) => e.id === c.electionId);
          return {
            href: `/candidates/${c.slug}`,
            title: c.ballotName ?? person?.fullName ?? c.slug,
            description: person
              ? `${person.fullName}${election ? ` · ${election.title}` : ""}`
              : election?.title,
            kind: `${c.party} · ${c.status.replace(/_/g, " ")}`,
            meta: election?.date,
            tone: "blue" as const,
          };
        })}
      />
    </div>
  );
}
