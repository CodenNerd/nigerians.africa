import Link from "next/link";
import { store } from "@nigeria-for-nigerians/domain";
import { RecordPage, RecordSection, RelatedLinks } from "@/components/RecordPage";
import { PlacesMap } from "@/components/PlacesMap";
import { EntityCover, EntityList } from "@/components/ui";
import { StatusLabel } from "@/components/StatusLabel";

function childHref(type: string, childSlug: string) {
  if (type === "state") return `/places/states/${childSlug}`;
  if (type === "lga") return `/places/lgas/${childSlug}`;
  if (type === "ward") return `/places/wards/${childSlug}`;
  if (type === "community") return `/places/communities/${childSlug}`;
  return "/places";
}

export function PlaceRecord({ slug }: { slug: string }) {
  const place = store.locationBySlug(slug);
  if (!place) return null;

  const children = store.childrenOf(place.id);
  const problems = store.allProblems().filter((p) => p.locationIds.includes(place.id));
  const projects = store.allProjects().filter((p) => p.locationId === place.id);
  const reports = store.reports().filter((r) => r.locationId === place.id);
  const orgs = store.allOrganizations().filter((o) => o.locationId === place.id);
  const offices = store.allInstitutions().filter((i) => i.locationId === place.id);

  return (
    <RecordPage
      eyebrow={`Place · ${place.type}`}
      title={place.name}
      subtitle={place.summary}
      askContext={`What is happening in ${place.name}?`}
      hero={
        place.coverUrl ? (
          <EntityCover
            title={place.name}
            coverUrl={place.coverUrl}
            coverCredit={place.coverCredit}
            eyebrow={`Place · ${place.type}`}
          />
        ) : undefined
      }
      hideHeader={Boolean(place.coverUrl)}
      contributions={{ entityType: "place", entityId: place.id, entityTitle: place.name }}
    >
      <RecordSection title="Map">
        <PlacesMap
          points={[
            {
              id: place.id,
              name: place.name,
              lat: place.lat,
              lng: place.lng,
              href: childHref(place.type, place.slug),
              kind: place.type,
            },
            ...children.map((c) => ({
              id: c.id,
              name: c.name,
              lat: c.lat,
              lng: c.lng,
              href: childHref(c.type, c.slug),
              kind: c.type,
            })),
          ]}
          center={[place.lat, place.lng]}
        />
      </RecordSection>

      {children.length ? (
        <RecordSection title="Within this place" meta={`${children.length}`}>
          <RelatedLinks
            items={children.map((c) => ({
              href: childHref(c.type, c.slug),
              label: c.name,
              hint: c.type,
            }))}
          />
        </RecordSection>
      ) : null}

      <RecordSection title="Problems" subtitle="Newest first." meta={`${problems.length}`}>
        <EntityList
          items={problems.map((p) => ({
            href: `/problems/${p.slug}`,
            title: p.title,
            kind: p.category,
            date: p.firstReportedAt,
            tone: "red" as const,
            imageUrl: p.coverUrl,
            meta: <StatusLabel status={p.verificationStatus} />,
          }))}
          empty="No problems linked to this place yet."
        />
      </RecordSection>

      <RecordSection title="Projects" subtitle="Newest activity first." meta={`${projects.length}`}>
        <EntityList
          items={projects.map((p) => ({
            href: `/projects/${p.slug}`,
            title: p.name,
            kind: p.status.replace(/_/g, " "),
            date: p.startDate,
            tone: "green" as const,
            imageUrl: p.coverUrl,
          }))}
          empty="No projects linked to this place yet."
        />
      </RecordSection>

      <RecordSection title="Citizen reports" subtitle="Newest first." meta={`${reports.length}`}>
        <EntityList
          items={reports.map((r) => ({
            href: `/action#reports`,
            title: r.title,
            description: r.description,
            date: r.submittedAt,
            tone: "amber" as const,
          }))}
          empty="No reports linked to this place in the seed record."
        />
      </RecordSection>

      {orgs.length ? (
        <RecordSection title="Organizations">
          <RelatedLinks
            items={orgs.map((o) => ({
              href: `/organizations/${o.slug}`,
              label: o.name,
              hint: o.type,
            }))}
          />
        </RecordSection>
      ) : null}

      {offices.length ? (
        <RecordSection title="Institutions here">
          <RelatedLinks
            items={offices.map((i) => ({
              href: `/government/institutions/${i.slug}`,
              label: i.name,
              hint: i.type,
            }))}
          />
        </RecordSection>
      ) : null}

      <p className="text-sm text-ink-faint">
        <Link href="/places" className="text-civic-green hover:underline">
          ← All places
        </Link>
      </p>
    </RecordPage>
  );
}
