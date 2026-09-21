/** Actor-form kinds for organizations — distinct from NGO focus categories. */

export type OrganizationTypeId =
  | "ngo"
  | "community_organization"
  | "contractor"
  | "foundation"
  | "development_organization"
  | "legal_organization"
  | "social_enterprise"
  | "research_organization"
  | "other";

export type OrganizationTypeMeta = {
  id: OrganizationTypeId;
  /** Value stored on Organization.type when seeded. */
  label: string;
  description: string;
  examples: string;
};

export const ORGANIZATION_TYPES: OrganizationTypeMeta[] = [
  {
    id: "ngo",
    label: "NGO",
    description: "Civil-society organisations with a programme or advocacy mandate.",
    examples: "Monitoring, legal aid, humanitarian relief, civic education",
  },
  {
    id: "community_organization",
    label: "Community Organization",
    description: "Neighbourhood and community associations — including CDS/CDA-style bodies.",
    examples: "CDAs, resident associations, community monitors",
  },
  {
    id: "contractor",
    label: "Contractor",
    description: "Private firms awarded public works or service contracts.",
    examples: "Road builders, grid contractors, facility rehab firms",
  },
  {
    id: "foundation",
    label: "Foundation",
    description: "Grant-making and philanthropic organisations.",
    examples: "Endowments, donor foundations, corporate foundations",
  },
  {
    id: "development_organization",
    label: "Development Organization",
    description: "Development programmes and implementing partners.",
    examples: "Multi-sector development agencies, programme consortia",
  },
  {
    id: "legal_organization",
    label: "Legal Organization",
    description: "Law firms and specialised legal bodies (when not classified as NGO).",
    examples: "Chambers, legal societies, specialised practice groups",
  },
  {
    id: "social_enterprise",
    label: "Social Enterprise",
    description: "Mission-driven businesses with a public-interest purpose.",
    examples: "Impact ventures, cooperative enterprises",
  },
  {
    id: "research_organization",
    label: "Research Organization",
    description: "Think tanks and research institutes.",
    examples: "Policy institutes, data labs, academic centres",
  },
  {
    id: "other",
    label: "Other",
    description: "Actors that do not fit the forms above.",
    examples: "Hybrid entities, unclassified organisations",
  },
];

export function organizationTypeById(id: string): OrganizationTypeMeta | undefined {
  return ORGANIZATION_TYPES.find((t) => t.id === id);
}

export function organizationTypeByLabel(label: string): OrganizationTypeMeta | undefined {
  const normalized = label.trim().toLowerCase();
  return ORGANIZATION_TYPES.find((t) => t.label.toLowerCase() === normalized);
}

export function isOrganizationTypeId(id: string): id is OrganizationTypeId {
  return ORGANIZATION_TYPES.some((t) => t.id === id);
}
