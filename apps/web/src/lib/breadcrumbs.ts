import { store, type Location } from "@nigeria-for-nigerians/domain";

export type Crumb = {
  label: string;
  /** Omit on the current page crumb. */
  href?: string;
};

const HUB_LABELS: Record<string, string> = {
  money: "Money",
  organizations: "Organizations",
  people: "People",
  problems: "Problems",
  projects: "Projects",
  places: "Places",
  government: "Government",
  guidance: "Guidance",
  evidence: "Evidence",
  events: "Events",
  candidates: "Candidates",
  schemes: "Schemes",
  action: "Action",
  following: "Following",
  report: "Report",
  ask: "Ask",
  search: "Search",
  about: "About",
  admin: "Admin",
  record: "Record",
  signin: "Sign in",
};

function titleCaseSegment(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function placeHref(loc: Location): string | undefined {
  switch (loc.type) {
    case "state":
      return `/places/states/${loc.slug}`;
    case "lga":
      return `/places/lgas/${loc.slug}`;
    case "ward":
      return `/places/wards/${loc.slug}`;
    case "community":
      return `/places/communities/${loc.slug}`;
    default:
      return undefined;
  }
}

/** Ancestors + self, country nodes omitted (no dossier route). */
function placeChain(leaf: Location): Location[] {
  const chain: Location[] = [];
  let current: Location | undefined = leaf;
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    if (current.type !== "country" && current.type !== "polling_unit") {
      chain.unshift(current);
    }
    if (!current.parentId) break;
    current = store.locations().find((l) => l.id === current!.parentId);
  }
  return chain;
}

function home(): Crumb {
  return { href: "/", label: "Home" };
}

/**
 * Build breadcrumb trail for a pathname.
 * Returns `null` on home (`/`) so the bar can hide.
 */
export function buildBreadcrumbs(pathname: string): Crumb[] | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return null;

  const parts = path.split("/").filter(Boolean);

  // —— Places (full geo chain) ——
  const placeMatch = path.match(/^\/places\/(states|lgas|wards|communities)\/([^/]+)$/);
  if (placeMatch) {
    const slug = placeMatch[2];
    const leaf = store.locationBySlug(slug);
    const crumbs: Crumb[] = [home(), { href: "/places", label: "Places" }];
    if (!leaf) {
      crumbs.push({ label: titleCaseSegment(slug) });
      return crumbs;
    }
    const chain = placeChain(leaf);
    chain.forEach((loc, i) => {
      const isLast = i === chain.length - 1;
      const href = placeHref(loc);
      if (isLast) crumbs.push({ label: loc.name });
      else if (href) crumbs.push({ href, label: loc.name });
      else crumbs.push({ label: loc.name });
    });
    return crumbs;
  }

  if (path === "/places") {
    return [home(), { label: "Places" }];
  }

  // —— Money ——
  if (path === "/money") {
    return [home(), { label: "Money" }];
  }

  const budgetMatch = path.match(/^\/money\/budgets\/([^/]+)$/);
  if (budgetMatch) {
    const budget = store.budgetBySlug(budgetMatch[1]);
    return [
      home(),
      { href: "/money", label: "Money" },
      { label: "Budgets" },
      { label: budget?.title ?? titleCaseSegment(budgetMatch[1]) },
    ];
  }

  // Allocation dossier — not /money/budgets
  if (parts[0] === "money" && parts.length === 2 && parts[1] !== "budgets") {
    const allocation = store.allocationBySlug(parts[1]);
    return [
      home(),
      { href: "/money", label: "Money" },
      { label: "Allocations" },
      { label: allocation?.program ?? titleCaseSegment(parts[1]) },
    ];
  }

  // —— Organizations ——
  if (parts[0] === "organizations") {
    const crumbs: Crumb[] = [home(), { href: "/organizations", label: "Organizations" }];

    if (parts.length === 1) {
      return [home(), { label: "Organizations" }];
    }

    if (parts[1] === "ngos") {
      crumbs.push({
        href: parts.length > 2 ? "/organizations/ngos" : undefined,
        label: "NGOs",
      });
      if (parts.length === 2) {
        crumbs[crumbs.length - 1] = { label: "NGOs" };
        return crumbs;
      }
      const cat = store.ngoCategoryMeta(parts[2]);
      crumbs.push({ label: cat?.label ?? titleCaseSegment(parts[2]) });
      return crumbs;
    }

    if (parts[1] === "types") {
      if (parts.length === 2) {
        crumbs.push({ label: "Types" });
        return crumbs;
      }
      crumbs.push({ label: "Types" });
      const typeMeta = store.organizationTypeMeta(parts[2]);
      crumbs.push({ label: typeMeta?.label ?? titleCaseSegment(parts[2]) });
      return crumbs;
    }

    // Org dossier
    const org = store.organizationBySlug(parts[1]);
    crumbs.push({ label: org?.name ?? titleCaseSegment(parts[1]) });
    return crumbs;
  }

  // —— Schemes / matters ——
  if (parts[0] === "schemes") {
    const crumbs: Crumb[] = [home(), { href: "/schemes/make-nigeria-better", label: "Schemes" }];
    if (parts.length === 1) {
      return [home(), { label: "Schemes" }];
    }
    const scheme = store.schemeBySlug(parts[1]);
    if (parts.length === 2) {
      crumbs.push({ label: scheme?.name ?? titleCaseSegment(parts[1]) });
      return crumbs;
    }
    crumbs.push({
      href: `/schemes/${parts[1]}`,
      label: scheme?.name ?? titleCaseSegment(parts[1]),
    });
    const matter = store.matterBySlug(parts[2]);
    crumbs.push({ label: matter?.title ?? titleCaseSegment(parts[2]) });
    return crumbs;
  }

  // —— Government ——
  if (parts[0] === "government") {
    const crumbs: Crumb[] = [home(), { href: "/government", label: "Government" }];
    if (parts.length === 1) return [home(), { label: "Government" }];
    if (parts[1] === "institutions" && parts[2]) {
      crumbs.push({ href: "/government", label: "Institutions" });
      const inst = store.institutionBySlug(parts[2]);
      crumbs.push({ label: inst?.name ?? titleCaseSegment(parts[2]) });
      return crumbs;
    }
    if (parts[1] === "offices" && parts[2]) {
      crumbs.push({ href: "/government", label: "Offices" });
      const office = store.officeBySlug(parts[2]);
      crumbs.push({ label: office?.name ?? titleCaseSegment(parts[2]) });
      return crumbs;
    }
  }

  // —— People / problems / projects / evidence / guidance / candidates ——
  if (parts[0] === "people") {
    if (parts.length === 1) return [home(), { label: "People" }];
    const person = store.personBySlug(parts[1]);
    return [
      home(),
      { href: "/people", label: "People" },
      { label: person?.fullName ?? titleCaseSegment(parts[1]) },
    ];
  }

  if (parts[0] === "problems") {
    if (parts.length === 1) return [home(), { label: "Problems" }];
    const problem = store.problemBySlug(parts[1]);
    return [
      home(),
      { href: "/problems", label: "Problems" },
      { label: problem?.title ?? titleCaseSegment(parts[1]) },
    ];
  }

  if (parts[0] === "projects") {
    if (parts.length === 1) return [home(), { label: "Projects" }];
    const project = store.projectBySlug(parts[1]);
    return [
      home(),
      { href: "/projects", label: "Projects" },
      { label: project?.name ?? titleCaseSegment(parts[1]) },
    ];
  }

  if (parts[0] === "evidence" && parts[1]) {
    const evidence = store.evidenceById(parts[1]);
    return [
      home(),
      { label: "Evidence" },
      { label: evidence?.title ?? titleCaseSegment(parts[1]) },
    ];
  }

  if (parts[0] === "guidance") {
    if (parts.length === 1) return [home(), { label: "Guidance" }];
    const topic = store.guidanceBySlug(parts[1]);
    return [
      home(),
      { href: "/guidance", label: "Guidance" },
      { label: topic?.title ?? titleCaseSegment(parts[1]) },
    ];
  }

  if (parts[0] === "candidates") {
    if (parts.length === 1) return [home(), { label: "Candidates" }];
    // candidates often mirror people slugs
    const person = store.personBySlug(parts[1]);
    return [
      home(),
      { href: "/candidates", label: "Candidates" },
      { label: person?.fullName ?? titleCaseSegment(parts[1]) },
    ];
  }

  // —— Events ——
  if (parts[0] === "events") {
    const crumbs: Crumb[] = [home(), { href: "/events", label: "Events" }];
    if (parts.length === 1) return [home(), { label: "Events" }];

    if (parts[1] === "elections") {
      crumbs.push({
        href: parts.length > 2 ? "/events" : undefined,
        label: "Elections",
      });
      if (parts.length === 2) {
        crumbs[crumbs.length - 1] = { label: "Elections" };
        return crumbs;
      }
      const event = store.eventBySlug(parts[2]);
      if (parts.length === 3) {
        crumbs.push({ label: event?.title ?? titleCaseSegment(parts[2]) });
        return crumbs;
      }
      crumbs.push({
        href: `/events/elections/${parts[2]}`,
        label: event?.title ?? titleCaseSegment(parts[2]),
      });
      if (parts[3] === "polling-units" && parts[4]) {
        crumbs.push({ label: titleCaseSegment(parts[4]) });
      }
      return crumbs;
    }

    const event = store.eventBySlug(parts[1]);
    crumbs.push({ label: event?.title ?? titleCaseSegment(parts[1]) });
    return crumbs;
  }

  // —— Generic hub / nested fallback ——
  const crumbs: Crumb[] = [home()];
  let acc = "";
  parts.forEach((segment, i) => {
    acc += `/${segment}`;
    const isLast = i === parts.length - 1;
    const label = HUB_LABELS[segment] ?? titleCaseSegment(segment);
    if (isLast) crumbs.push({ label });
    else crumbs.push({ href: acc, label });
  });
  return crumbs;
}
