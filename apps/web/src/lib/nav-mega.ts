export type NavTone = "green" | "blue" | "amber" | "red" | "slate";

export type NavIconId =
  | "person"
  | "building"
  | "map"
  | "money"
  | "alert"
  | "hammer"
  | "bolt"
  | "document"
  | "eye"
  | "org"
  | "ballot"
  | "search";

export type MegaFeatured = {
  href: string;
  title: string;
  description?: string;
  kind?: string;
  imageUrl?: string;
  initials?: string;
  tone: NavTone;
  large?: boolean;
};

export type MegaQuickLink = {
  href: string;
  label: string;
  hint?: string;
  icon: NavIconId;
};

export type MegaPopular = {
  href: string;
  label: string;
};

export type MegaMenuConfig = {
  id: string;
  href: string;
  label: string;
  eyebrow: string;
  featured: MegaFeatured[];
  quickLinks: MegaQuickLink[];
  popular: MegaPopular[];
  browseAll: { href: string; label: string };
};

/** Curated mega-menu content for the eight primary hubs. */
export const NAV_MEGA: MegaMenuConfig[] = [
  {
    id: "government",
    href: "/government",
    label: "Government",
    eyebrow: "Digital twin",
    featured: [
      {
        href: "/government/offices/president-of-nigeria",
        title: "Office of the President",
        description: "Federal executive — mandate, holder, FOI path.",
        kind: "Federal office",
        tone: "green",
        large: true,
        initials: "PR",
      },
      {
        href: "/government/offices/governor-lagos",
        title: "Governor of Lagos State",
        kind: "State office",
        tone: "blue",
        initials: "LG",
      },
      {
        href: "/government/offices/commissioner-works-lagos",
        title: "Commissioner for Works",
        kind: "Lagos",
        tone: "amber",
        initials: "WK",
      },
    ],
    quickLinks: [
      { href: "/government", label: "Browse all offices", hint: "By level", icon: "building" },
      {
        href: "/report?kind=foi",
        label: "Start an FOI",
        hint: "Freedom of Information",
        icon: "document",
      },
      {
        href: "/government/institutions/presidency",
        label: "The Presidency",
        hint: "Institution",
        icon: "building",
      },
      {
        href: "/government/institutions/ministry-of-works",
        label: "Ministry of Works",
        hint: "Federal",
        icon: "hammer",
      },
    ],
    popular: [
      { href: "/search?q=president", label: "President" },
      { href: "/search?q=Lagos+governor", label: "Lagos governor" },
      { href: "/search?q=INEC", label: "INEC" },
      { href: "/guidance/freedom-of-information", label: "FOI guidance" },
    ],
    browseAll: { href: "/government", label: "Browse all Government" },
  },
  {
    id: "problems",
    href: "/problems",
    label: "Problems",
    eyebrow: "Public problems",
    featured: [
      {
        href: "/problems/abandoned-urban-roads-ikeja",
        title: "Abandoned urban roads — Ikeja",
        description: "Signature civic problem linked to projects and money.",
        kind: "Infrastructure",
        tone: "amber",
        large: true,
        initials: "RD",
      },
      {
        href: "/problems/electricity-access",
        title: "Electricity access",
        kind: "National",
        tone: "red",
        initials: "EL",
      },
      {
        href: "/problems/urban-flooding",
        title: "Urban flooding",
        kind: "Environment",
        tone: "blue",
        initials: "FL",
      },
    ],
    quickLinks: [
      { href: "/problems", label: "All problems", icon: "alert" },
      { href: "/report", label: "Report what you see", hint: "Photo or video", icon: "bolt" },
      { href: "/guidance", label: "What should I do?", icon: "document" },
      {
        href: "/guidance/abandoned-public-project",
        label: "Abandoned project guidance",
        icon: "hammer",
      },
    ],
    popular: [
      { href: "/search?q=abandoned+road", label: "Abandoned road" },
      { href: "/search?q=electricity", label: "Electricity" },
      { href: "/search?q=flooding", label: "Flooding" },
      { href: "/search?q=corruption", label: "Corruption" },
    ],
    browseAll: { href: "/problems", label: "Browse all Problems" },
  },
  {
    id: "money",
    href: "/money",
    label: "Money",
    eyebrow: "Follow the money",
    featured: [
      {
        href: "/money/alloc-allen-avenue-spur",
        title: "Allen Avenue Spur allocation",
        description: "Released vs approved on the signature road thread.",
        kind: "Allocation",
        tone: "green",
        large: true,
        initials: "₦",
      },
      {
        href: "/money#budget-lagos-2024",
        title: "Lagos capital — Works",
        kind: "Budget",
        tone: "blue",
        initials: "LG",
      },
      {
        href: "/money#budget-fed-national-2025",
        title: "Federal national budget 2025",
        kind: "Budget",
        tone: "amber",
        initials: "FD",
      },
    ],
    quickLinks: [
      { href: "/money", label: "All money records", icon: "money" },
      {
        href: "/projects/allen-avenue-spur-rehabilitation",
        label: "Follow the thread",
        hint: "Project ↔ money",
        icon: "hammer",
      },
      { href: "/projects", label: "Linked projects", icon: "hammer" },
      { href: "/ask", label: "Ask about spending", icon: "search" },
    ],
    popular: [
      { href: "/search?q=Allen+Avenue", label: "Allen Avenue" },
      { href: "/search?q=budget", label: "Budget" },
      { href: "/search?q=allocation", label: "Allocation" },
      { href: "/search?q=Lagos+works", label: "Lagos works" },
    ],
    browseAll: { href: "/money", label: "Browse all Money" },
  },
  {
    id: "projects",
    href: "/projects",
    label: "Projects",
    eyebrow: "Delivery records",
    featured: [
      {
        href: "/projects/allen-avenue-spur-rehabilitation",
        title: "Allen Avenue Spur rehabilitation",
        description: "Signature thread — money, evidence, office responsibility.",
        kind: "Signature",
        tone: "green",
        large: true,
        initials: "AS",
      },
      {
        href: "/projects/omole-drainage-upgrade",
        title: "Omole drainage upgrade",
        kind: "Lagos",
        tone: "blue",
        initials: "OM",
      },
      {
        href: "/projects/kano-periurban-electrification",
        title: "Kano peri-urban electrification",
        kind: "Power",
        tone: "amber",
        initials: "KN",
      },
    ],
    quickLinks: [
      { href: "/projects", label: "All projects", icon: "hammer" },
      {
        href: "/projects/allen-avenue-spur-rehabilitation",
        label: "Follow the thread",
        icon: "eye",
      },
      { href: "/money", label: "Linked money", icon: "money" },
      { href: "/report", label: "Report site condition", icon: "bolt" },
    ],
    popular: [
      { href: "/search?q=Allen+Avenue+Spur", label: "Allen Avenue Spur" },
      { href: "/search?q=drainage", label: "Drainage" },
      { href: "/search?q=electrification", label: "Electrification" },
      { href: "/search?q=abandoned+project", label: "Abandoned project" },
    ],
    browseAll: { href: "/projects", label: "Browse all Projects" },
  },
  {
    id: "places",
    href: "/places",
    label: "Places",
    eyebrow: "Geographic twin",
    featured: [
      {
        href: "/places",
        title: "Places map",
        description: "Toggle problems, projects, reports and offices on the civic map.",
        kind: "Explore",
        tone: "green",
        large: true,
        initials: "NG",
      },
      {
        href: "/places/states/lagos",
        title: "Lagos State",
        kind: "State",
        tone: "blue",
        initials: "LA",
      },
      {
        href: "/places/lgas/ikeja",
        title: "Ikeja LGA",
        kind: "LGA",
        tone: "amber",
        initials: "IK",
      },
    ],
    quickLinks: [
      { href: "/places", label: "Open Places hub", icon: "map" },
      { href: "/places/states/lagos", label: "Lagos State", icon: "map" },
      { href: "/places/wards/allen-avenue-ward", label: "Allen Avenue Ward", icon: "map" },
      { href: "/places/communities/omole", label: "Omole community", icon: "map" },
    ],
    popular: [
      { href: "/search?q=Lagos", label: "Lagos" },
      { href: "/search?q=Ikeja", label: "Ikeja" },
      { href: "/search?q=Abuja", label: "Abuja" },
      { href: "/search?q=polling+unit", label: "Polling unit" },
    ],
    browseAll: { href: "/places", label: "Browse all Places" },
  },
  {
    id: "people",
    href: "/people",
    label: "People",
    eyebrow: "Public personalities",
    featured: [
      {
        href: "/people/bola-ahmed-tinubu",
        title: "Bola Ahmed Tinubu",
        description: "President of Nigeria — structured public research record.",
        kind: "President",
        tone: "green",
        large: true,
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/c/cd/Bola_Tinubu_portrait_%28cropped%29.jpg",
        initials: "BT",
      },
      {
        href: "/people/tunde-adebayo",
        title: "Engr. Tunde Adebayo",
        kind: "State official",
        tone: "blue",
        initials: "TA",
      },
      {
        href: "/people/chioma-okonkwo",
        title: "Chioma Okonkwo",
        kind: "Legislator",
        tone: "amber",
        initials: "CO",
      },
    ],
    quickLinks: [
      { href: "/people", label: "All personalities", icon: "person" },
      { href: "/people#criteria", label: "Who appears here", hint: "PPP criteria", icon: "document" },
      {
        href: "/government/offices/president-of-nigeria",
        label: "Office of the President",
        icon: "building",
      },
      { href: "/admin", label: "Verifier desk", hint: "Claim review", icon: "eye" },
    ],
    popular: [
      { href: "/search?q=Tinubu", label: "Tinubu" },
      { href: "/search?q=President", label: "President" },
      { href: "/search?q=Lagos+governor", label: "Lagos governor" },
      { href: "/search?q=public+personality", label: "Public personality" },
    ],
    browseAll: { href: "/people", label: "Browse all People" },
  },
  {
    id: "cases",
    href: "/schemes/make-nigeria-better",
    label: "Cases",
    eyebrow: "Make Nigeria Better",
    featured: [
      {
        href: "/schemes/make-nigeria-better",
        title: "The Make Nigeria Better Project",
        description: "Citizen video of lawlessness — legal NGOs pick up the case.",
        kind: "Scheme",
        tone: "green",
        large: true,
        initials: "MB",
      },
      {
        href: "/schemes/make-nigeria-better/checkpoint-cash-demand-ikeja",
        title: "Checkpoint cash demand — Ikeja",
        kind: "Awaiting NGO",
        tone: "amber",
        initials: "CK",
      },
      {
        href: "/schemes/make-nigeria-better/traffic-shakedown-kano",
        title: "Traffic shakedown — Kano",
        kind: "Filed",
        tone: "red",
        initials: "TR",
      },
      {
        href: "/schemes/make-nigeria-better/market-stall-assault-lagos",
        title: "Market stall assault — Lagos",
        kind: "Accepted",
        tone: "amber",
        initials: "MK",
      },
    ],
    quickLinks: [
      { href: "/schemes/make-nigeria-better", label: "All cases", icon: "eye" },
      {
        href: "/report?scheme=make-nigeria-better",
        label: "Publish evidence",
        hint: "Video or report",
        icon: "bolt",
      },
      {
        href: "/organizations/citizens-legal-rights-initiative",
        label: "Citizens Legal Rights",
        hint: "Legal NGO",
        icon: "org",
      },
      {
        href: "/organizations/public-justice-network",
        label: "Public Justice Network",
        hint: "Legal NGO",
        icon: "org",
      },
    ],
    popular: [
      { href: "/schemes/make-nigeria-better", label: "Make Nigeria Better" },
      { href: "/report?scheme=make-nigeria-better", label: "Publish evidence" },
      {
        href: "/schemes/make-nigeria-better/checkpoint-cash-demand-ikeja",
        label: "Checkpoint Ikeja",
      },
      {
        href: "/schemes/make-nigeria-better/traffic-shakedown-kano",
        label: "Traffic Kano",
      },
    ],
    browseAll: { href: "/schemes/make-nigeria-better", label: "Browse all Cases" },
  },
  {
    id: "action",
    href: "/action",
    label: "Action",
    eyebrow: "Pool accountability",
    featured: [
      {
        href: "/report",
        title: "See something? Report it",
        description: "Photo, video or text — connect to an office or problem.",
        kind: "Report",
        tone: "red",
        large: true,
        initials: "!",
      },
      {
        href: "/guidance/freedom-of-information",
        title: "Start an FOI",
        kind: "Guidance",
        tone: "blue",
        initials: "FI",
      },
      {
        href: "/guidance/bribery-corruption",
        title: "Bribery & corruption",
        kind: "Guidance",
        tone: "amber",
        initials: "BR",
      },
    ],
    quickLinks: [
      { href: "/action", label: "Civic action hub", icon: "bolt" },
      { href: "/organizations", label: "Vetted NGOs", hint: "Published spend", icon: "org" },
      {
        href: "/events/elections/2023-general-election-ikeja-demo",
        label: "Election evidence",
        hint: "PU counts",
        icon: "ballot",
      },
      { href: "/guidance", label: "All guidance", icon: "document" },
    ],
    popular: [
      { href: "/report", label: "Submit report" },
      { href: "/search?q=FOI", label: "FOI" },
      { href: "/organizations/civic-track-nigeria", label: "Civic Track NGO" },
      { href: "/action#foi", label: "FOI actions" },
    ],
    browseAll: { href: "/action", label: "Browse all Action" },
  },
];

export function megaByHref(href: string): MegaMenuConfig | undefined {
  return NAV_MEGA.find((m) => m.href === href);
}
