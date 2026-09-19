import { store } from "@nigeria-for-nigerians/domain";
import type { MapLayerId, MapPoint } from "@/components/PlacesMap";

function locCoords(locationId: string | undefined) {
  if (!locationId) return null;
  const loc = store.locations().find((l) => l.id === locationId);
  if (!loc || loc.lat == null || loc.lng == null) return null;
  return { lat: loc.lat, lng: loc.lng, placeName: loc.name };
}

/** Deterministic tiny offset so co-located markers don't stack. */
function offset(id: string, index: number): { dLat: number; dLng: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const a = ((h % 20) - 10) / 500;
  const b = (((h >> 4) % 20) - 10) / 500;
  return { dLat: a + index * 0.004, dLng: b };
}

/** Build Places map civic overlay points from the seed graph. */
export function buildGodsEyePoints(): MapPoint[] {
  const points: MapPoint[] = [];
  const seen = new Set<string>();

  function push(p: MapPoint) {
    if (seen.has(p.id)) return;
    seen.add(p.id);
    points.push(p);
  }

  for (const l of store.locations()) {
    if (!["state", "lga", "community", "ward"].includes(l.type)) continue;
    push({
      id: `place-${l.id}`,
      name: l.name,
      lat: l.lat,
      lng: l.lng,
      kind: l.type,
      layer: "places" as MapLayerId,
      href:
        l.type === "state"
          ? `/places/states/${l.slug}`
          : l.type === "lga"
            ? `/places/lgas/${l.slug}`
            : l.type === "ward"
              ? `/places/wards/${l.slug}`
              : `/places/communities/${l.slug}`,
    });
  }

  store.allProblems().forEach((problem, index) => {
    const coords = locCoords(problem.locationIds[0]);
    if (!coords) return;
    const o = offset(problem.id, index % 5);
    push({
      id: `problem-${problem.id}`,
      name: problem.title,
      lat: coords.lat + o.dLat,
      lng: coords.lng + o.dLng,
      kind: "problem",
      layer: "problems",
      href: `/problems/${problem.slug}`,
    });
  });

  store.allProjects().forEach((project, index) => {
    const coords = locCoords(project.locationId);
    if (!coords) return;
    const o = offset(project.id, index % 5);
    push({
      id: `project-${project.id}`,
      name: project.name,
      lat: coords.lat + o.dLat,
      lng: coords.lng + o.dLng,
      kind: "project",
      layer: "projects",
      href: `/projects/${project.slug}`,
    });
  });

  store.reports().forEach((report, index) => {
    const coords = locCoords(report.locationId);
    if (!coords) return;
    const o = offset(report.id, index % 5);
    push({
      id: `report-${report.id}`,
      name: report.title,
      lat: coords.lat + o.dLat,
      lng: coords.lng + o.dLng,
      kind: "report",
      layer: "reports",
      href: `/action#reports`,
    });
  });

  let officeIndex = 0;
  for (const institution of store.allInstitutions()) {
    const coords = locCoords(institution.locationId);
    if (!coords) continue;
    const offices = store.allOffices().filter((o) => o.institutionId === institution.id);
    const targets = offices.length > 0 ? offices.slice(0, 2) : [];
    if (targets.length === 0) {
      const o = offset(institution.id, officeIndex++);
      push({
        id: `inst-${institution.id}`,
        name: institution.name,
        lat: coords.lat + o.dLat,
        lng: coords.lng + o.dLng,
        kind: "institution",
        layer: "offices",
        href: `/government`,
      });
      continue;
    }
    for (const office of targets) {
      const o = offset(office.id, officeIndex++);
      push({
        id: `office-${office.id}`,
        name: office.name,
        lat: coords.lat + o.dLat,
        lng: coords.lng + o.dLng,
        kind: "office",
        layer: "offices",
        href: `/government/offices/${office.slug}`,
      });
    }
  }

  return points;
}
