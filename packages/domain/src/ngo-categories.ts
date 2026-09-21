import type { NgoCategoryId } from "./types";

export type NgoCategoryMeta = {
  id: NgoCategoryId;
  label: string;
  description: string;
  examples: string;
};

/** Catalog of NGO focus categories for browse, nav, and dossier chips. */
export const NGO_CATEGORIES: NgoCategoryMeta[] = [
  {
    id: "humanitarian",
    label: "Humanitarian",
    description: "Emergency and crisis response",
    examples: "Food, shelter, disaster relief, displacement",
  },
  {
    id: "human_rights",
    label: "Human Rights",
    description: "Protect and advocate for rights",
    examples: "Legal rights, civil liberties, detention monitoring",
  },
  {
    id: "legal_aid",
    label: "Legal / Legal Aid",
    description: "Provide legal services or representation",
    examples: "Litigation, legal advice, public-interest cases",
  },
  {
    id: "anti_corruption",
    label: "Anti-Corruption & Accountability",
    description: "Investigate and promote public accountability",
    examples: "Public spending, corruption investigations, FOI",
  },
  {
    id: "civic",
    label: "Civic / Democracy",
    description: "Strengthen citizen participation",
    examples: "Elections, civic education, governance",
  },
  {
    id: "community_development",
    label: "Community Development",
    description: "Improve local communities",
    examples: "Water, sanitation, infrastructure, livelihoods",
  },
  {
    id: "health",
    label: "Health",
    description: "Improve health outcomes",
    examples: "Clinics, maternal health, disease prevention",
  },
  {
    id: "education",
    label: "Education",
    description: "Improve access and quality of education",
    examples: "Schools, scholarships, literacy",
  },
  {
    id: "environment",
    label: "Environment & Climate",
    description: "Environmental protection",
    examples: "Pollution, conservation, climate resilience",
  },
  {
    id: "economic_empowerment",
    label: "Economic Empowerment",
    description: "Improve livelihoods",
    examples: "Jobs, entrepreneurship, financial inclusion",
  },
  {
    id: "youth",
    label: "Youth",
    description: "Focus on youth development",
    examples: "Skills, employment, leadership",
  },
  {
    id: "women",
    label: "Women & Gender",
    description: "Support women and address gender issues",
    examples: "Economic empowerment, protection, advocacy",
  },
  {
    id: "children",
    label: "Children & Family",
    description: "Protect and support children/families",
    examples: "Child protection, education, welfare",
  },
  {
    id: "disability",
    label: "Disability / Inclusion",
    description: "Support accessibility and inclusion",
    examples: "Disability rights, assistive services",
  },
  {
    id: "research",
    label: "Research / Policy",
    description: "Produce research and policy work",
    examples: "Policy analysis, datasets, reports",
  },
  {
    id: "media",
    label: "Media / Public Interest",
    description: "Public-interest information",
    examples: "Investigative journalism, civic information",
  },
  {
    id: "professional",
    label: "Professional / Technical",
    description: "Provide specialized expertise",
    examples: "Engineering, technology, accounting, etc.",
  },
  {
    id: "faith_based",
    label: "Faith-based / Community-based",
    description: "Social work organized around a community or faith",
    examples: "Relief, education, community services",
  },
];

export function ngoCategoryById(id: string): NgoCategoryMeta | undefined {
  return NGO_CATEGORIES.find((c) => c.id === id);
}

export function isNgoCategoryId(id: string): id is NgoCategoryId {
  return NGO_CATEGORIES.some((c) => c.id === id);
}
