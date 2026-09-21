import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { PersonProfile } from "@/components/ppp/PersonProfile";
import { RecordPage, RecordSection, RelatedLinks } from "@/components/RecordPage";
import { seedFollowBase } from "@/lib/follow/seed-counts";

export function generateStaticParams() {
  return store.allPeople().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = store.personBySlug(slug);
  return {
    title: person ? person.fullName : "Person",
    description: person?.bio,
  };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = store.personBySlug(slug);
  if (!person) notFound();

  if (person.isPublicPersonality) {
    return <PersonProfile person={person} />;
  }

  const orgs = store.organizationsForPerson(person.id);

  return (
    <RecordPage
      eyebrow={person.classification ?? "Person"}
      title={person.fullName}
      subtitle={person.bio}
      askContext={person.fullName}
      follow={{ entityType: "person", entityId: person.id, entityTitle: person.fullName }}
      followCount={seedFollowBase("person", person.id)}
      actions={[
        { label: "Browse people", href: "/people" },
        { label: "Report an issue", href: "/report" },
      ]}
    >
      <RecordSection title="About">
        <p className="prose-record">{person.bio}</p>
        <p className="mt-3 text-sm italic text-ink-faint">
          This is a structured public record, not a judgment about the person.
        </p>
      </RecordSection>

      <RecordSection
        title="Organizations"
        subtitle="Roles linked to this person on the public record."
        meta={`${orgs.length} organizations`}
      >
        {orgs.length === 0 ? (
          <p className="text-sm text-ink-muted">No organization links yet.</p>
        ) : (
          <RelatedLinks
            items={orgs.map(({ organization, role }) => ({
              href: `/organizations/${organization.slug}`,
              label: organization.name,
              hint: role,
            }))}
          />
        )}
      </RecordSection>

      <p className="mt-2 text-sm text-ink-faint">
        Looking for public office holders?{" "}
        <Link href="/people" className="text-civic-green hover:underline">
          Browse public personality profiles
        </Link>
        .
      </p>
    </RecordPage>
  );
}
