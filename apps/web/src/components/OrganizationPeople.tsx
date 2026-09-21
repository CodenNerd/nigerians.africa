import Image from "next/image";
import Link from "next/link";
import type { Person } from "@nigeria-for-nigerians/domain";

export function OrganizationPeople({
  people,
}: {
  people: { person: Person; role: string }[];
}) {
  if (!people.length) {
    return <p className="text-sm text-ink-muted">No people linked to this organization yet.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {people.map(({ person, role }) => (
        <li key={person.id}>
          <Link
            href={`/people/${person.slug}`}
            className="plane-link group flex items-center gap-3.5 border border-paper-border bg-paper-card px-3.5 py-3 no-underline transition hover:border-civic-green/30"
          >
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-paper-border bg-civic-greenSoft">
              {person.photoUrl ? (
                <Image
                  src={person.photoUrl}
                  alt=""
                  fill
                  className="object-cover object-top"
                  sizes="56px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-lg text-civic-green">
                  {person.photoInitials}
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg leading-snug text-ink group-hover:text-civic-green">
                {person.fullName}
              </span>
              <span className="mt-0.5 block text-sm text-ink-muted">{role}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
