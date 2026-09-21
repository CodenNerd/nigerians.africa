import type {
  Evidence,
  Institution,
  Location,
  Organization,
  Person,
  Problem,
  Project,
  SeedDatabase,
} from "../types";

const WM = "https://upload.wikimedia.org/wikipedia/commons";

/** Proven Commons URLs (verified in-repo / live HEAD checks). */
const COVERS = {
  lagos: `${WM}/e/ea/Lagos_Nigeria.jpg`,
  lagosAerial: `${WM}/e/ee/Aerial_view_of_Marina%2C_Lagos_Island_East%2C_Lagos-Nigeria.jpg`,
  lagosMarina: `${WM}/b/b5/Marina_road_leading_to_uba_house%2C_lagos%2C_Nigeria.jpg`,
  badRoad: `${WM}/8/8a/Bad_road_in_lagos_Nigeria_2020_07_02.jpg`,
  bridge: `${WM}/7/77/Third_Mainland_Bridge.jpg`,
  presidential: `${WM}/a/a7/Nigerian_Presidential_Complex.jpg`,
  flag: `${WM}/7/79/Flag_of_Nigeria.svg`,
  coatOfArms: `${WM}/b/bc/Coat_of_arms_of_Nigeria.svg`,
  flood: `${WM}/4/45/Flooded_road_in_Lagos.jpg`,
  tinubuPortrait: `${WM}/c/cd/Bola_Tinubu_portrait_%28cropped%29.jpg`,
} as const;

const LOCATION_COVERS: Record<string, { coverUrl: string; coverCredit: string }> = {
  "loc-ng": { coverUrl: COVERS.flag, coverCredit: "Wikimedia Commons — Flag of Nigeria" },
  "loc-lagos": { coverUrl: COVERS.lagos, coverCredit: "Wikimedia Commons — Lagos" },
  "loc-ikeja": { coverUrl: COVERS.badRoad, coverCredit: "Wikimedia Commons — Bad road in Lagos" },
  "loc-allen-ward": { coverUrl: COVERS.lagosMarina, coverCredit: "Wikimedia Commons — Marina road, Lagos" },
  "loc-omole": { coverUrl: COVERS.flood, coverCredit: "Wikimedia Commons — Flooded road in Lagos" },
  "loc-pu012": { coverUrl: COVERS.lagosAerial, coverCredit: "Wikimedia Commons — Lagos Island aerial" },
  "loc-pu013": { coverUrl: COVERS.lagosMarina, coverCredit: "Wikimedia Commons — Marina road, Lagos" },
  "loc-pu014": { coverUrl: COVERS.flood, coverCredit: "Wikimedia Commons — Flooded road in Lagos" },
  "loc-abuja": { coverUrl: COVERS.presidential, coverCredit: "Wikimedia Commons — Presidential Complex" },
  "loc-kano": { coverUrl: COVERS.bridge, coverCredit: "Wikimedia Commons — Third Mainland Bridge (stand-in infrastructure)" },
  "loc-rivers": { coverUrl: COVERS.lagosAerial, coverCredit: "Wikimedia Commons — Lagos aerial (coastal stand-in)" },
};

const PROBLEM_COVERS: Record<string, { coverUrl: string; coverCredit: string }> = {
  "prob-roads-ikeja": { coverUrl: COVERS.badRoad, coverCredit: "Wikimedia Commons — Bad road in Lagos" },
  "prob-electricity": { coverUrl: COVERS.lagosAerial, coverCredit: "Wikimedia Commons — Lagos aerial" },
  "prob-flooding": { coverUrl: COVERS.flood, coverCredit: "Wikimedia Commons — Flooded road in Lagos" },
  "prob-healthcare": { coverUrl: COVERS.presidential, coverCredit: "Wikimedia Commons — Presidential Complex" },
  "prob-water": { coverUrl: COVERS.flood, coverCredit: "Wikimedia Commons — Flooded road in Lagos" },
  "prob-security": { coverUrl: COVERS.lagos, coverCredit: "Wikimedia Commons — Lagos" },
  "prob-education": { coverUrl: COVERS.lagosMarina, coverCredit: "Wikimedia Commons — Marina road, Lagos" },
  "prob-corruption": { coverUrl: COVERS.presidential, coverCredit: "Wikimedia Commons — Presidential Complex" },
  "prob-environment": { coverUrl: COVERS.badRoad, coverCredit: "Wikimedia Commons — Bad road in Lagos" },
  "prob-employment": { coverUrl: COVERS.lagos, coverCredit: "Wikimedia Commons — Lagos" },
};

const PROJECT_COVERS: Record<string, { coverUrl: string; coverCredit: string }> = {
  "proj-allen-spur": { coverUrl: COVERS.badRoad, coverCredit: "Wikimedia Commons — Bad road in Lagos" },
  "proj-omole-drain": { coverUrl: COVERS.flood, coverCredit: "Wikimedia Commons — Flooded road in Lagos" },
  "proj-rural-power": { coverUrl: COVERS.lagosAerial, coverCredit: "Wikimedia Commons — Lagos aerial" },
  "proj-phc-rivers": { coverUrl: COVERS.presidential, coverCredit: "Wikimedia Commons — Presidential Complex" },
  "proj-fct-schools": { coverUrl: COVERS.lagosMarina, coverCredit: "Wikimedia Commons — Marina road, Lagos" },
  "proj-lagos-water": { coverUrl: COVERS.flood, coverCredit: "Wikimedia Commons — Flooded road in Lagos" },
  "proj-rivers-waste": { coverUrl: COVERS.badRoad, coverCredit: "Wikimedia Commons — Bad road in Lagos" },
};

const INSTITUTION_LOGOS: Record<string, { logoUrl: string; logoCredit: string }> = {
  "inst-fg": { logoUrl: COVERS.coatOfArms, logoCredit: "Wikimedia Commons — Coat of arms of Nigeria" },
  "inst-presidency": { logoUrl: COVERS.coatOfArms, logoCredit: "Wikimedia Commons — Coat of arms of Nigeria" },
  "inst-works-fed": { logoUrl: "/institutions/ministry-of-works.svg", logoCredit: "Platform mark" },
  "inst-power": { logoUrl: "/institutions/ministry-of-power.svg", logoCredit: "Platform mark" },
  "inst-nass": { logoUrl: "/institutions/national-assembly.svg", logoCredit: "Platform mark" },
  "inst-judiciary": { logoUrl: "/institutions/federal-judiciary.svg", logoCredit: "Platform mark" },
  "inst-lagos": { logoUrl: "/institutions/lagos-state-government.svg", logoCredit: "Platform mark" },
  "inst-lagos-works": { logoUrl: "/institutions/lagos-ministry-of-works.svg", logoCredit: "Platform mark" },
  "inst-ikeja-lga": { logoUrl: "/institutions/ikeja-local-government.svg", logoCredit: "Platform mark" },
  "inst-inec": {
    logoUrl: "https://www.google.com/s2/favicons?domain=inec.gov.ng&sz=128",
    logoCredit: "INEC website favicon",
  },
};

const EVIDENCE_POSTERS = [
  COVERS.lagos,
  COVERS.badRoad,
  COVERS.flood,
  COVERS.lagosAerial,
  COVERS.presidential,
  COVERS.lagosMarina,
  COVERS.bridge,
];

function enrichPerson(p: Person): Person {
  if (p.photoUrl) return p;
  return {
    ...p,
    photoUrl: `https://i.pravatar.cc/300?u=${encodeURIComponent(p.id)}`,
  };
}

function enrichOrganization(o: Organization): Organization {
  if (o.logoUrl) return o;
  return {
    ...o,
    logoUrl: `/orgs/${o.slug}.svg`,
    logoCredit: "Platform mark",
  };
}

function enrichInstitution(i: Institution): Institution {
  if (i.logoUrl) return i;
  const mapped = INSTITUTION_LOGOS[i.id];
  if (mapped) return { ...i, ...mapped };
  return {
    ...i,
    logoUrl: `/institutions/${i.slug}.svg`,
    logoCredit: "Platform mark",
  };
}

function enrichLocation(l: Location): Location {
  if (l.coverUrl) return l;
  const mapped = LOCATION_COVERS[l.id];
  return mapped ? { ...l, ...mapped } : { ...l, coverUrl: COVERS.lagos, coverCredit: "Wikimedia Commons — Lagos" };
}

function enrichProblem(p: Problem): Problem {
  if (p.coverUrl) return p;
  const mapped = PROBLEM_COVERS[p.id];
  return mapped
    ? { ...p, ...mapped }
    : { ...p, coverUrl: COVERS.lagos, coverCredit: "Wikimedia Commons — Lagos" };
}

function enrichProject(p: Project): Project {
  const mapped = PROJECT_COVERS[p.id];
  if (mapped) return { ...p, coverUrl: mapped.coverUrl, coverCredit: mapped.coverCredit };
  if (p.coverUrl) return p;
  return { ...p, coverUrl: COVERS.lagos, coverCredit: "Wikimedia Commons — Lagos" };
}

function enrichEvidence(e: Evidence, index: number): Evidence {
  if (e.posterUrl) return e;
  const needsPoster =
    e.mediaKind === "video" ||
    e.type === "Video" ||
    e.type === "Audio" ||
    (typeof e.mediaUrl === "string" && e.mediaUrl.includes("youtube"));
  if (needsPoster || !e.mediaUrl) {
    return { ...e, posterUrl: EVIDENCE_POSTERS[index % EVIDENCE_POSTERS.length] };
  }
  return e;
}

/** Fill missing photos, logos, and covers after seed merge. */
export function enrichSeedVisuals(db: SeedDatabase): SeedDatabase {
  return {
    ...db,
    people: db.people.map(enrichPerson),
    organizations: db.organizations.map(enrichOrganization),
    institutions: db.institutions.map(enrichInstitution),
    locations: db.locations.map(enrichLocation),
    problems: db.problems.map(enrichProblem),
    projects: db.projects.map(enrichProject),
    evidence: db.evidence.map(enrichEvidence),
  };
}

export { COVERS };
