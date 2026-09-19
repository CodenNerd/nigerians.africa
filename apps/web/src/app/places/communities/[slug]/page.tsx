import { notFound } from "next/navigation";
import { store } from "@nigeria-for-nigerians/domain";
import { PlaceRecord } from "@/components/PlaceRecord";

export function generateStaticParams() {
  return store
    .locations()
    .filter((l) => l.type === "community")
    .map((l) => ({ slug: l.slug }));
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!store.locationBySlug(slug)) notFound();
  return <PlaceRecord slug={slug} />;
}
