import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { PersonProfile } from "@/components/ppp/PersonProfile";

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
  if (!person || !person.isPublicPersonality) notFound();

  return <PersonProfile person={person} />;
}
