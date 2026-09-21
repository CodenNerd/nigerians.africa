import { seed } from "./seed/data";
import { NGO_CATEGORIES, ngoCategoryById, type NgoCategoryMeta } from "./ngo-categories";
import {
  ORGANIZATION_TYPES,
  organizationTypeById,
  organizationTypeByLabel,
  type OrganizationTypeId,
  type OrganizationTypeMeta,
} from "./organization-types";
import type {
  Allocation,
  CitizenReport,
  CivicEvent,
  Claim,
  DonationCampaign,
  EntityType,
  Evidence,
  FundingInflow,
  FundingSource,
  FundingStatus,
  GuidanceTopic,
  Institution,
  Location,
  MatterCategory,
  MatterStatus,
  NgoCategoryId,
  Office,
  Organization,
  Person,
  Problem,
  Project,
  ProjectSpend,
  PublicRecordItem,
  SeedDatabase,
  Source,
} from "./types";

export type ThreadNode = {
  type: EntityType;
  id: string;
  label: string;
  href: string;
  relationship?: string;
};

export type ProjectHandlerKind = "government" | "business" | "ngo" | "community";

export type ProjectHandler = {
  kind: ProjectHandlerKind;
  label: string;
  href: string;
};

export type ProjectIndexEntry = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: Project["status"];
  verificationStatus: Project["verificationStatus"];
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  approvedAmount: number;
  releasedAmount: number;
  reportedSpend: number;
  progressPercent: number;
  fundingStatus: FundingStatus;
  fundingPercent: number;
  budgetTarget: number;
  completed: boolean;
  stateId?: string;
  stateSlug?: string;
  stateName?: string;
  locationName?: string;
  handlers: ProjectHandler[];
  handlerKinds: ProjectHandlerKind[];
  officeId?: string;
  allocationId?: string;
  allocationSlug?: string;
  allocationLabel?: string;
  budgetId?: string;
  budgetLabel?: string;
  hasCampaign: boolean;
  coverUrl?: string;
};

export type ProjectFacets = {
  states: { id: string; slug: string; name: string; count: number }[];
  statuses: { id: Project["status"]; count: number }[];
  fundingStatuses: { id: FundingStatus; count: number }[];
  handlerKinds: { id: ProjectHandlerKind; count: number }[];
  budgets: { id: string; label: string; count: number }[];
  allocations: { id: string; slug: string; label: string; count: number }[];
};

export type ProjectFundingLedger = {
  budgetTarget: number;
  receivedTotal: number;
  spendTotal: number;
  fundingPercent: number;
  fundingStatus: FundingStatus;
  sources: FundingSource[];
  campaigns: DonationCampaign[];
  inflows: FundingInflow[];
  spends: ProjectSpend[];
};

export type OrgProjectRole = "contractor" | "implementer" | "funder" | "campaign_host";

export type ProjectRecordEventKind =
  | "status"
  | "funding"
  | "spend"
  | "evidence"
  | "campaign"
  | "report"
  | "response"
  | "contract"
  | "memory";

export type ProjectRecordEvent = {
  id: string;
  date: string;
  kind: ProjectRecordEventKind;
  title: string;
  description?: string;
  href?: string;
};

export type OrgProjectLink = {
  project: Project;
  roles: OrgProjectRole[];
  fundingStatus: FundingStatus;
  fundingPercent: number;
};

export type SchemeGlance = {
  totalMatters: number;
  awaitingNgo: number;
  inProgress: number;
  closed: number;
  byStatus: Record<MatterStatus, number>;
  byCategory: { category: MatterCategory; count: number }[];
  partnerCount: number;
  evidenceCount: number;
};

const MATTER_STATUSES: MatterStatus[] = [
  "published",
  "under_review",
  "accepted",
  "filed",
  "in_hearing",
  "closed_won",
  "closed_lost",
  "closed_withdrawn",
  "archived",
];

/** Pipeline step 0..5 for progress meters on matter tiles. */
export function matterProgressIndex(status: MatterStatus): number {
  switch (status) {
    case "published":
      return 0;
    case "under_review":
      return 1;
    case "accepted":
      return 2;
    case "filed":
      return 3;
    case "in_hearing":
      return 4;
    case "closed_won":
    case "closed_lost":
    case "closed_withdrawn":
    case "archived":
      return 5;
    default:
      return 0;
  }
}

export const MATTER_PROGRESS_STEPS = 6;

const PROGRESS_BY_STATUS: Record<Project["status"], number> = {
  planned: 5,
  started: 30,
  in_progress: 55,
  delayed: 50,
  completed: 100,
  abandoned: 0,
  cancelled: 0,
};

export const KANBAN_STATUSES: Project["status"][] = [
  "planned",
  "started",
  "in_progress",
  "delayed",
  "completed",
  "abandoned",
];

export const FUNDING_STATUS_LABEL: Record<FundingStatus, string> = {
  unfunded: "Unfunded",
  partially_funded: "Partially funded",
  fully_funded: "Fully funded",
};

function hrefFor(type: EntityType, id: string, db: SeedDatabase): string {
  switch (type) {
    case "person": {
      const p = db.people.find((x) => x.id === id);
      return p ? `/people/${p.slug}` : "/people";
    }
    case "office": {
      const o = db.offices.find((x) => x.id === id);
      return o ? `/government/offices/${o.slug}` : "/government";
    }
    case "institution": {
      const i = db.institutions.find((x) => x.id === id);
      return i ? `/government/institutions/${i.slug}` : "/government";
    }
    case "problem": {
      const p = db.problems.find((x) => x.id === id);
      return p ? `/problems/${p.slug}` : "/problems";
    }
    case "project": {
      const p = db.projects.find((x) => x.id === id);
      return p ? `/projects/${p.slug}` : "/projects";
    }
    case "money": {
      const a = db.allocations.find((x) => x.id === id);
      return a ? `/money/${a.slug}` : "/money";
    }
    case "place": {
      const l = db.locations.find((x) => x.id === id);
      if (!l) return "/places";
      if (l.type === "state") return `/places/states/${l.slug}`;
      if (l.type === "lga") return `/places/lgas/${l.slug}`;
      if (l.type === "ward") return `/places/wards/${l.slug}`;
      if (l.type === "community") return `/places/communities/${l.slug}`;
      return "/places";
    }
    case "organization": {
      const o = db.organizations.find((x) => x.id === id);
      return o ? `/organizations/${o.slug}` : "/organizations";
    }
    case "evidence": {
      const e = db.evidence.find((x) => x.id === id);
      return e ? `/evidence/${e.id}` : "/evidence";
    }
    case "report":
      return `/action#reports`;
    case "response":
      return `/projects/allen-avenue-spur-rehabilitation#responses`;
    case "event": {
      const ev = db.events.find((x) => x.id === id);
      return ev?.type === "election"
        ? `/events/elections/${ev.slug}`
        : ev
          ? `/events/${ev.slug}`
          : "/events";
    }
    case "claim":
      return `/people/tunde-adebayo#claims`;
    case "source":
      return `/evidence`;
    case "scheme": {
      const s = db.civicSchemes.find((x) => x.id === id);
      return s ? `/schemes/${s.slug}` : "/schemes/make-nigeria-better";
    }
    case "matter": {
      const m = db.prosecutionMatters.find((x) => x.id === id);
      if (!m) return "/schemes/make-nigeria-better";
      const scheme = db.civicSchemes.find((x) => x.id === m.schemeId);
      return scheme
        ? `/schemes/${scheme.slug}/${m.slug}`
        : `/schemes/make-nigeria-better/${m.slug}`;
    }
    default:
      return "/";
  }
}

function labelFor(type: EntityType, id: string, db: SeedDatabase): string {
  switch (type) {
    case "person":
      return db.people.find((x) => x.id === id)?.fullName ?? id;
    case "office":
      return db.offices.find((x) => x.id === id)?.name ?? id;
    case "institution":
      return db.institutions.find((x) => x.id === id)?.name ?? id;
    case "problem":
      return db.problems.find((x) => x.id === id)?.title ?? id;
    case "project":
      return db.projects.find((x) => x.id === id)?.name ?? id;
    case "money":
      return db.allocations.find((x) => x.id === id)?.program ?? id;
    case "place":
      return db.locations.find((x) => x.id === id)?.name ?? id;
    case "organization":
      return db.organizations.find((x) => x.id === id)?.name ?? id;
    case "evidence":
      return db.evidence.find((x) => x.id === id)?.title ?? id;
    case "report":
      return db.reports.find((x) => x.id === id)?.title ?? id;
    case "response":
      return db.responses.find((x) => x.id === id)?.statement.slice(0, 80) ?? id;
    case "event":
      return db.events.find((x) => x.id === id)?.title ?? id;
    case "claim":
      return db.claims.find((x) => x.id === id)?.statement.slice(0, 80) ?? id;
    case "scheme":
      return db.civicSchemes.find((x) => x.id === id)?.name ?? id;
    case "matter":
      return db.prosecutionMatters.find((x) => x.id === id)?.title ?? id;
    default:
      return id;
  }
}

function projectActivityDate(p: Project): string {
  const hist = p.statusHistory?.map((h) => h.effectiveAt) ?? [];
  const dates = [p.startDate, p.actualEndDate, ...hist].filter(Boolean) as string[];
  if (!dates.length) return p.startDate ?? "0000-01-01";
  return dates.reduce((a, b) => (a > b ? a : b));
}

function byDateDesc(a: string | undefined, b: string | undefined): number {
  return (b ?? "").localeCompare(a ?? "");
}

export class PublicRecordStore {
  constructor(private db: SeedDatabase = seed) {}

  get raw(): SeedDatabase {
    return this.db;
  }

  allProblems(): Problem[] {
    return [...this.db.problems].sort((a, b) => byDateDesc(a.firstReportedAt, b.firstReportedAt));
  }

  problemBySlug(slug: string): Problem | undefined {
    return this.db.problems.find((p) => p.slug === slug);
  }

  allProjects(): Project[] {
    return [...this.db.projects].sort((a, b) =>
      byDateDesc(projectActivityDate(a), projectActivityDate(b)),
    );
  }

  projectBySlug(slug: string): Project | undefined {
    return this.db.projects.find((p) => p.slug === slug);
  }

  featuredProjects(): Project[] {
    return this.allProjects().filter((p) => p.featured);
  }

  /**
   * Who is handling a project — Government / Business / NGO / Community chips.
   */
  projectHandlers(projectId: string): ProjectHandler[] {
    const project = this.db.projects.find((p) => p.id === projectId);
    if (!project) return [];
    const out: ProjectHandler[] = [];
    const seen = new Set<string>();

    const push = (h: ProjectHandler) => {
      const key = `${h.kind}:${h.href}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(h);
    };

    const office = this.db.offices.find((o) => o.id === project.responsibleOfficeId);
    if (office) {
      push({
        kind: "government",
        label: office.name,
        href: `/government/offices/${office.slug}`,
      });
    }

    if (project.contractorId) {
      const contractor = this.db.organizations.find((o) => o.id === project.contractorId);
      if (contractor) {
        push({
          kind: "business",
          label: contractor.name,
          href: `/organizations/${contractor.slug}`,
        });
      }
    }

    for (const org of this.db.organizations.filter((o) => o.projectIds.includes(projectId))) {
      if (org.id === project.contractorId) continue;
      const t = org.type.toLowerCase();
      if (t.includes("contractor") || t.includes("company") || t.includes("ltd")) {
        push({ kind: "business", label: org.name, href: `/organizations/${org.slug}` });
      } else if (
        t.includes("community") ||
        t.includes("cda") ||
        t.includes("cds") ||
        t.includes("association")
      ) {
        push({ kind: "community", label: org.name, href: `/organizations/${org.slug}` });
      } else if (t.includes("ngo") || t.includes("civil") || t.includes("civic")) {
        push({ kind: "ngo", label: org.name, href: `/organizations/${org.slug}` });
      } else if (org.type === "NGO") {
        push({ kind: "ngo", label: org.name, href: `/organizations/${org.slug}` });
      } else {
        push({ kind: "ngo", label: org.name, href: `/organizations/${org.slug}` });
      }
    }

    return out;
  }

  /** Walk location parents until a state (or FCT-as-state) is found. */
  stateForLocation(locationId: string): Location | undefined {
    let current = this.db.locations.find((l) => l.id === locationId);
    const seen = new Set<string>();
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      if (current.type === "state") return current;
      if (!current.parentId) break;
      current = this.db.locations.find((l) => l.id === current!.parentId);
    }
    return undefined;
  }

  progressForProject(project: Project): number {
    if (typeof project.progressPercent === "number") {
      return Math.max(0, Math.min(100, project.progressPercent));
    }
    return PROGRESS_BY_STATUS[project.status] ?? 0;
  }

  budgetTargetFor(project: Project): number {
    return project.budgetTargetAmount ?? project.approvedAmount ?? 0;
  }

  fundingForProject(projectId: string): ProjectFundingLedger {
    const project = this.db.projects.find((p) => p.id === projectId);
    const sources = (this.db.fundingSources ?? []).filter((s) => s.projectId === projectId);
    const campaigns = (this.db.donationCampaigns ?? []).filter((c) => c.projectId === projectId);
    const inflows = [...(this.db.fundingInflows ?? []).filter((i) => i.projectId === projectId)].sort(
      (a, b) => byDateDesc(a.receivedAt, b.receivedAt),
    );
    const spends = [...(this.db.projectSpends ?? []).filter((s) => s.projectId === projectId)].sort(
      (a, b) => byDateDesc(a.spentAt, b.spentAt),
    );

    const inflowTotal = inflows.reduce((sum, i) => sum + i.amount, 0);
    const sourceReceived = sources.reduce((sum, s) => sum + s.receivedAmount, 0);
    const receivedTotal =
      inflowTotal > 0
        ? inflowTotal
        : sourceReceived > 0
          ? sourceReceived
          : (project?.releasedAmount ?? 0);
    const spendTotal =
      spends.length > 0
        ? spends.reduce((sum, s) => sum + s.amount, 0)
        : (project?.reportedSpend ?? 0);
    const budgetTarget = project ? this.budgetTargetFor(project) : 0;
    const fundingPercent =
      budgetTarget > 0 ? Math.min(100, Math.round((receivedTotal / budgetTarget) * 100)) : 0;
    let fundingStatus: FundingStatus = "unfunded";
    if (receivedTotal <= 0) fundingStatus = "unfunded";
    else if (budgetTarget > 0 && receivedTotal >= budgetTarget * 0.98) fundingStatus = "fully_funded";
    else fundingStatus = "partially_funded";

    return {
      budgetTarget,
      receivedTotal,
      spendTotal,
      fundingPercent,
      fundingStatus,
      sources,
      campaigns,
      inflows,
      spends,
    };
  }

  /**
   * Comprehensive project dossier timeline: work status, money, evidence, reports, memory.
   */
  projectRecordTimeline(projectId: string): ProjectRecordEvent[] {
    const project = this.db.projects.find((p) => p.id === projectId);
    if (!project) return [];
    const events: ProjectRecordEvent[] = [];

    for (const h of project.statusHistory ?? []) {
      events.push({
        id: `status-${h.status}-${h.effectiveAt}`,
        date: h.effectiveAt,
        kind: "status",
        title: `Work status · ${h.status.replace(/_/g, " ")}`,
        description: h.reason,
      });
    }

    for (const inflow of this.db.fundingInflows ?? []) {
      if (inflow.projectId !== projectId) continue;
      events.push({
        id: `inflow-${inflow.id}`,
        date: inflow.receivedAt,
        kind: "funding",
        title: `Funding received · ${this.formatNaira(inflow.amount)}`,
        description: `${inflow.payerLabel} via ${inflow.channel.replace(/_/g, " ")}`,
      });
    }

    for (const spend of this.db.projectSpends ?? []) {
      if (spend.projectId !== projectId) continue;
      events.push({
        id: `spend-${spend.id}`,
        date: spend.spentAt,
        kind: "spend",
        title: `Spend recorded · ${this.formatNaira(spend.amount)}`,
        description: `${spend.category} — ${spend.payeeLabel}${spend.notes ? `. ${spend.notes}` : ""}`,
      });
    }

    for (const camp of this.db.donationCampaigns ?? []) {
      if (camp.projectId !== projectId) continue;
      // Use earliest related inflow date or a synthetic open date from raised progress
      const campInflows = (this.db.fundingInflows ?? []).filter((i) => i.campaignId === camp.id);
      const openDate =
        campInflows.map((i) => i.receivedAt).sort()[0] ??
        project.startDate ??
        "2024-01-01";
      events.push({
        id: `campaign-${camp.id}`,
        date: openDate,
        kind: "campaign",
        title: `Funding request opened · ${camp.platform}`,
        description: `${camp.title} — goal ${this.formatNaira(camp.goalAmount)}`,
        href: camp.url,
      });
    }

    const evidenceRows = [
      ...this.evidenceFor("project", projectId),
      ...(project.problemId ? this.evidenceFor("problem", project.problemId) : []),
    ];
    const seenEv = new Set<string>();
    for (const e of evidenceRows) {
      if (seenEv.has(e.id)) continue;
      seenEv.add(e.id);
      const kindLabel =
        e.mediaKind === "video" ? "Video" : e.mediaKind === "image" ? "Photo" : e.type;
      events.push({
        id: `evidence-${e.id}`,
        date: e.capturedAt,
        kind: "evidence",
        title: `${kindLabel} uploaded · ${e.title}`,
        description: e.description,
        href: `/evidence/${e.id}`,
      });
    }

    for (const r of this.db.reports.filter((x) => x.projectId === projectId)) {
      events.push({
        id: `report-${r.id}`,
        date: r.submittedAt || r.capturedAt,
        kind: "report",
        title: `Citizen report · ${r.title}`,
        description: r.description,
      });
      for (const resp of this.responsesFor("report", r.id)) {
        events.push({
          id: `response-${resp.id}`,
          date: resp.publishedAt,
          kind: "response",
          title: "Official response published",
          description: resp.statement.slice(0, 160) + (resp.statement.length > 160 ? "…" : ""),
        });
      }
    }

    for (const c of this.db.contracts.filter((x) => x.projectId === projectId)) {
      events.push({
        id: `contract-${c.id}`,
        date: c.awardedAt,
        kind: "contract",
        title: `Contract awarded · ${this.formatNaira(c.amount)}`,
        description: `${c.title} — ${c.contractorName}`,
      });
    }

    for (const m of this.memoryFor("project", projectId)) {
      events.push({
        id: `memory-${m.id}`,
        date: m.date,
        kind: "memory",
        title: `Record · ${m.eventType}`,
        description: m.description,
      });
    }

    return events.sort((a, b) => byDateDesc(a.date, b.date));
  }

  projectsForOrganization(orgId: string): OrgProjectLink[] {
    const rolesByProject = new Map<string, Set<OrgProjectRole>>();

    const add = (projectId: string, role: OrgProjectRole) => {
      let set = rolesByProject.get(projectId);
      if (!set) {
        set = new Set();
        rolesByProject.set(projectId, set);
      }
      set.add(role);
    };

    const org = this.db.organizations.find((o) => o.id === orgId);
    if (org) {
      for (const pid of org.projectIds) add(pid, "implementer");
    }
    for (const p of this.db.projects) {
      if (p.contractorId === orgId) add(p.id, "contractor");
    }
    for (const s of this.db.fundingSources ?? []) {
      if (s.organizationId === orgId) add(s.projectId, "funder");
    }
    for (const c of this.db.donationCampaigns ?? []) {
      if (c.organizationId === orgId) add(c.projectId, "campaign_host");
    }
    for (const s of this.db.projectSpends ?? []) {
      if (s.organizationId === orgId) add(s.projectId, "implementer");
    }

    const out: OrgProjectLink[] = [];
    for (const [projectId, roles] of rolesByProject) {
      const project = this.db.projects.find((p) => p.id === projectId);
      if (!project) continue;
      const funding = this.fundingForProject(projectId);
      out.push({
        project,
        roles: [...roles],
        fundingStatus: funding.fundingStatus,
        fundingPercent: funding.fundingPercent,
      });
    }
    return out.sort((a, b) =>
      byDateDesc(
        a.project.actualEndDate ?? a.project.startDate,
        b.project.actualEndDate ?? b.project.startDate,
      ),
    );
  }

  /** Denormalised index for the Projects explorer filters + kanban. */
  projectIndex(): ProjectIndexEntry[] {
    return this.allProjects().map((p) => {
      const loc = this.db.locations.find((l) => l.id === p.locationId);
      const state = this.stateForLocation(p.locationId);
      const handlers = this.projectHandlers(p.id);
      const allocation = this.db.allocations.find((a) => a.projectId === p.id);
      const budget = allocation
        ? this.db.budgets.find((b) => b.id === allocation.budgetId)
        : undefined;
      const progressPercent = this.progressForProject(p);
      const funding = this.fundingForProject(p.id);
      const completed = p.status === "completed" || Boolean(p.actualEndDate);

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        status: p.status,
        verificationStatus: p.verificationStatus,
        startDate: p.startDate,
        expectedEndDate: p.expectedEndDate,
        actualEndDate: p.actualEndDate,
        approvedAmount: p.approvedAmount,
        releasedAmount: p.releasedAmount,
        reportedSpend: p.reportedSpend,
        progressPercent,
        fundingStatus: funding.fundingStatus,
        fundingPercent: funding.fundingPercent,
        budgetTarget: funding.budgetTarget,
        completed,
        stateId: state?.id,
        stateSlug: state?.slug,
        stateName: state?.name,
        locationName: loc?.name,
        handlers,
        handlerKinds: [...new Set(handlers.map((h) => h.kind))],
        officeId: p.responsibleOfficeId,
        allocationId: allocation?.id,
        allocationSlug: allocation?.slug,
        allocationLabel: allocation?.program,
        budgetId: budget?.id,
        budgetLabel: budget ? `${budget.title} (${budget.fiscalYear})` : undefined,
        hasCampaign: funding.campaigns.length > 0,
        coverUrl: p.coverUrl,
      };
    });
  }

  projectFacets(entries?: ProjectIndexEntry[]): ProjectFacets {
    const list = entries ?? this.projectIndex();
    const countMap = <T extends string>(keys: T[]) => {
      const m = new Map<T, number>();
      for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
      return m;
    };

    const stateCounts = new Map<string, { id: string; slug: string; name: string; count: number }>();
    for (const e of list) {
      if (!e.stateId || !e.stateSlug || !e.stateName) continue;
      const prev = stateCounts.get(e.stateId);
      if (prev) prev.count += 1;
      else stateCounts.set(e.stateId, { id: e.stateId, slug: e.stateSlug, name: e.stateName, count: 1 });
    }

    const statusCounts = countMap(list.map((e) => e.status));
    const fundingCounts = countMap(list.map((e) => e.fundingStatus));
    const handlerCounts = countMap(list.flatMap((e) => e.handlerKinds));

    const budgetCounts = new Map<string, { id: string; label: string; count: number }>();
    for (const e of list) {
      if (!e.budgetId || !e.budgetLabel) continue;
      const prev = budgetCounts.get(e.budgetId);
      if (prev) prev.count += 1;
      else budgetCounts.set(e.budgetId, { id: e.budgetId, label: e.budgetLabel, count: 1 });
    }

    const allocCounts = new Map<string, { id: string; slug: string; label: string; count: number }>();
    for (const e of list) {
      if (!e.allocationId || !e.allocationSlug || !e.allocationLabel) continue;
      const prev = allocCounts.get(e.allocationId);
      if (prev) prev.count += 1;
      else
        allocCounts.set(e.allocationId, {
          id: e.allocationId,
          slug: e.allocationSlug,
          label: e.allocationLabel,
          count: 1,
        });
    }

    return {
      states: [...stateCounts.values()].sort((a, b) => a.name.localeCompare(b.name)),
      statuses: [...statusCounts.entries()]
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => a.id.localeCompare(b.id)),
      fundingStatuses: [...fundingCounts.entries()]
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => a.id.localeCompare(b.id)),
      handlerKinds: [...handlerCounts.entries()]
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => a.id.localeCompare(b.id)),
      budgets: [...budgetCounts.values()].sort((a, b) => a.label.localeCompare(b.label)),
      allocations: [...allocCounts.values()].sort((a, b) => a.label.localeCompare(b.label)),
    };
  }

  allPeople(): Person[] {
    return this.db.people.filter((p) => p.isPublicPersonality);
  }

  personBySlug(slug: string): Person | undefined {
    return this.db.people.find((p) => p.slug === slug);
  }

  allInstitutions(): Institution[] {
    return this.db.institutions;
  }

  institutionBySlug(slug: string): Institution | undefined {
    return this.db.institutions.find((i) => i.slug === slug);
  }

  allOffices(): Office[] {
    return this.db.offices;
  }

  officeBySlug(slug: string): Office | undefined {
    return this.db.offices.find((o) => o.slug === slug);
  }

  tenuresForPerson(personId: string) {
    return this.db.tenures.filter((t) => t.personId === personId);
  }

  tenuresForOffice(officeId: string) {
    return [...this.db.tenures.filter((t) => t.officeId === officeId)].sort((a, b) =>
      a.startDate.localeCompare(b.startDate),
    );
  }

  currentHolder(officeId: string): Person | undefined {
    const tenure = this.db.tenures.find((t) => t.officeId === officeId && !t.endDate);
    return tenure ? this.db.people.find((p) => p.id === tenure.personId) : undefined;
  }

  locations(): Location[] {
    return this.db.locations;
  }

  locationBySlug(slug: string): Location | undefined {
    return this.db.locations.find((l) => l.slug === slug);
  }

  childrenOf(locationId: string): Location[] {
    return this.db.locations.filter((l) => l.parentId === locationId);
  }

  allOrganizations(): Organization[] {
    return this.db.organizations;
  }

  organizationBySlug(slug: string): Organization | undefined {
    return this.db.organizations.find((o) => o.slug === slug);
  }

  /** Civil-society actor: NGO type, legacy legal_ngo, or tagged focus categories. */
  isNgo(org: Organization): boolean {
    const t = org.type.toLowerCase();
    if (t === "ngo" || t === "legal_ngo") return true;
    return (org.ngoCategories?.length ?? 0) > 0;
  }

  /** Legal / public-interest partners (scheme prosecution NGOs). */
  isLegalNgo(org: Organization): boolean {
    if (org.type.toLowerCase() === "legal_ngo") return true;
    const cats = org.ngoCategories ?? [];
    return this.isNgo(org) && (cats.includes("legal_aid") || cats.includes("human_rights"));
  }

  allNgos(): Organization[] {
    return this.db.organizations.filter((o) => this.isNgo(o));
  }

  ngosByCategory(categoryId: NgoCategoryId): Organization[] {
    return this.allNgos().filter((o) => (o.ngoCategories ?? []).includes(categoryId));
  }

  ngoCategoryMeta(categoryId: string): NgoCategoryMeta | undefined {
    return ngoCategoryById(categoryId);
  }

  allNgoCategories(): NgoCategoryMeta[] {
    return NGO_CATEGORIES;
  }

  allOrganizationTypes(): OrganizationTypeMeta[] {
    return ORGANIZATION_TYPES;
  }

  organizationTypeMeta(typeId: string): OrganizationTypeMeta | undefined {
    return organizationTypeById(typeId);
  }

  /** Exact match on Organization.type label (e.g. "Contractor"). */
  organizationsByType(typeId: OrganizationTypeId): Organization[] {
    const meta = organizationTypeById(typeId);
    if (!meta) return [];
    return this.db.organizations.filter(
      (o) => o.type.toLowerCase() === meta.label.toLowerCase(),
    );
  }

  organizationTypeFor(org: Organization): OrganizationTypeMeta | undefined {
    return organizationTypeByLabel(org.type);
  }

  /**
   * Activity score for ranking “most active” NGOs.
   * Weights: prosecuting matters, linked projects, published spend/income lines, people.
   */
  organizationActivityScore(org: Organization): number {
    const matters = this.mattersForOrganization(org.id).length;
    const projects = this.projectsForOrganization(org.id).length;
    const spendLines = (org.spendLineItems ?? []).length;
    const incomeLines = (org.incomeLineItems ?? []).length;
    const people = org.people?.length ?? 0;
    const allocations = (org.projectAllocations ?? []).length;
    return (
      matters * 12 +
      projects * 8 +
      spendLines * 3 +
      incomeLines * 2 +
      allocations * 4 +
      people * 2 +
      (org.vettingStatus === "platform_vetted" ? 5 : 0)
    );
  }

  mostActiveNgos(limit = 6, categoryId?: NgoCategoryId): Organization[] {
    const pool = categoryId ? this.ngosByCategory(categoryId) : this.allNgos();
    return [...pool]
      .sort((a, b) => this.organizationActivityScore(b) - this.organizationActivityScore(a))
      .slice(0, limit);
  }

  /** People linked to an organization, with their role labels. */
  peopleForOrganization(orgId: string): { person: Person; role: string }[] {
    const org = this.db.organizations.find((o) => o.id === orgId);
    if (!org?.people?.length) return [];
    const out: { person: Person; role: string }[] = [];
    for (const entry of org.people) {
      const person = this.db.people.find((p) => p.id === entry.personId);
      if (person) out.push({ person, role: entry.role });
    }
    return out;
  }

  /** Organizations a person is linked to. */
  organizationsForPerson(personId: string): { organization: Organization; role: string }[] {
    const out: { organization: Organization; role: string }[] = [];
    for (const org of this.db.organizations) {
      for (const entry of org.people ?? []) {
        if (entry.personId === personId) {
          out.push({ organization: org, role: entry.role });
        }
      }
    }
    return out;
  }

  allBudgets() {
    return [...this.db.budgets].sort((a, b) => b.fiscalYear - a.fiscalYear);
  }

  budgetBySlug(slug: string) {
    return this.db.budgets.find((b) => b.slug === slug);
  }

  budgetById(id: string) {
    return this.db.budgets.find((b) => b.id === id);
  }

  allocationsForBudget(budgetId: string): Allocation[] {
    return [...this.db.allocations.filter((a) => a.budgetId === budgetId)].sort(
      (a, b) => b.amount - a.amount,
    );
  }

  allAllocations(): Allocation[] {
    const yearOf = (a: Allocation) =>
      this.db.budgets.find((b) => b.id === a.budgetId)?.fiscalYear ?? 0;
    return [...this.db.allocations].sort((a, b) => yearOf(b) - yearOf(a));
  }

  allocationBySlug(slug: string): Allocation | undefined {
    return this.db.allocations.find((a) => a.slug === slug);
  }

  contractsForAllocation(allocationId: string) {
    return [...this.db.contracts.filter((c) => c.allocationId === allocationId)].sort((a, b) =>
      byDateDesc(a.awardedAt, b.awardedAt),
    );
  }

  evidenceFor(entityType: EntityType, entityId: string): Evidence[] {
    return this.db.evidence
      .filter((e) => e.relatedEntityType === entityType && e.relatedEntityId === entityId)
      .sort((a, b) => byDateDesc(a.capturedAt, b.capturedAt));
  }

  evidenceById(id: string): Evidence | undefined {
    return this.db.evidence.find((e) => e.id === id);
  }

  sourceById(id: string): Source | undefined {
    return this.db.sources.find((s) => s.id === id);
  }

  claimsForPerson(personId: string): Claim[] {
    return this.db.claims
      .filter((c) => c.personId === personId)
      .sort((a, b) => byDateDesc(a.date, b.date));
  }

  reports(): CitizenReport[] {
    return [...this.db.reports].sort((a, b) => byDateDesc(a.submittedAt, b.submittedAt));
  }

  responsesFor(targetType: EntityType, targetId: string) {
    return this.db.responses
      .filter((r) => r.targetType === targetType && r.targetId === targetId)
      .sort((a, b) => byDateDesc(a.publishedAt, b.publishedAt));
  }

  memoryFor(entityType: EntityType, entityId: string) {
    return this.db.memory
      .filter((m) => m.entityType === entityType && m.entityId === entityId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  allMemory() {
    return [...this.db.memory].sort((a, b) => b.date.localeCompare(a.date));
  }

  events(): CivicEvent[] {
    return [...this.db.events].sort((a, b) => byDateDesc(a.date, b.date));
  }

  eventBySlug(slug: string): CivicEvent | undefined {
    return this.db.events.find((e) => e.slug === slug);
  }

  allPoliticalCandidates() {
    return this.db.politicalCandidates;
  }

  candidacyBySlug(slug: string) {
    return this.db.politicalCandidates.find((c) => c.slug === slug);
  }

  candidaciesForPerson(personId: string) {
    return this.db.politicalCandidates.filter((c) => c.personId === personId);
  }

  candidaciesForElection(electionId: string) {
    return this.db.politicalCandidates.filter((c) => c.electionId === electionId);
  }

  isPoliticalCandidate(personId: string): boolean {
    return this.candidaciesForPerson(personId).length > 0;
  }

  allCivicSchemes() {
    return this.db.civicSchemes;
  }

  schemeBySlug(slug: string) {
    return this.db.civicSchemes.find((s) => s.slug === slug);
  }

  allProsecutionMatters() {
    return [...this.db.prosecutionMatters].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
  }

  matterBySlug(slug: string) {
    return this.db.prosecutionMatters.find((m) => m.slug === slug);
  }

  mattersForScheme(schemeId: string) {
    return this.allProsecutionMatters().filter((m) => m.schemeId === schemeId);
  }

  mattersForOrganization(orgId: string) {
    return this.allProsecutionMatters().filter((m) => m.prosecutingOrgId === orgId);
  }

  schemeGlance(schemeId: string): SchemeGlance {
    const matters = this.mattersForScheme(schemeId);
    const byStatus = Object.fromEntries(MATTER_STATUSES.map((s) => [s, 0])) as Record<
      MatterStatus,
      number
    >;
    const categoryCounts = new Map<MatterCategory, number>();
    const partnerIds = new Set<string>();
    const evidenceIds = new Set<string>();

    let awaitingNgo = 0;
    let inProgress = 0;
    let closed = 0;

    for (const m of matters) {
      byStatus[m.status] = (byStatus[m.status] ?? 0) + 1;
      categoryCounts.set(m.category, (categoryCounts.get(m.category) ?? 0) + 1);
      for (const eid of m.evidenceIds) evidenceIds.add(eid);
      if (m.prosecutingOrgId) partnerIds.add(m.prosecutingOrgId);

      const closedStatuses: MatterStatus[] = [
        "closed_won",
        "closed_lost",
        "closed_withdrawn",
        "archived",
      ];
      if (closedStatuses.includes(m.status)) {
        closed += 1;
      } else if (
        m.status === "accepted" ||
        m.status === "filed" ||
        m.status === "in_hearing"
      ) {
        inProgress += 1;
      } else if (
        (m.status === "published" || m.status === "under_review") &&
        !m.prosecutingOrgId
      ) {
        awaitingNgo += 1;
      } else if (!m.prosecutingOrgId) {
        awaitingNgo += 1;
      }
    }

    // Also count legal / public-interest partners registered for the programme even if unassigned
    for (const o of this.db.organizations) {
      if (this.isLegalNgo(o)) partnerIds.add(o.id);
    }

    const byCategory = [...categoryCounts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

    return {
      totalMatters: matters.length,
      awaitingNgo,
      inProgress,
      closed,
      byStatus,
      byCategory,
      partnerCount: partnerIds.size,
      evidenceCount: evidenceIds.size,
    };
  }

  electionResults(electionId: string) {
    return this.db.electionResults.filter((r) => r.electionId === electionId);
  }

  discrepancies(electionId: string) {
    return this.db.discrepancies.filter((d) => d.electionId === electionId);
  }

  guidance(): GuidanceTopic[] {
    return this.db.guidance;
  }

  guidanceBySlug(slug: string): GuidanceTopic | undefined {
    return this.db.guidance.find((g) => g.slug === slug);
  }

  actions() {
    return [...this.db.actions].sort((a, b) => byDateDesc(a.createdAt, b.createdAt));
  }

  publicRecord() {
    return [...this.db.publicRecord].sort((a, b) => byDateDesc(a.date, b.date));
  }

  /**
   * Dense public-record stream: curated items plus synthesized memory / reports / claims.
   * Newest first. Deduped by href+title. Capped for demo surfaces.
   */
  recordStream(limit = 40): PublicRecordItem[] {
    const items: PublicRecordItem[] = [...this.db.publicRecord];

    for (const m of this.db.memory.slice(0, 12)) {
      items.push({
        id: `stream-mem-${m.id}`,
        date: m.date,
        kind: "Memory",
        title: m.description.slice(0, 100) + (m.description.length > 100 ? "…" : ""),
        summary: `${m.eventType.replace(/_/g, " ")} · political memory`,
        href: hrefFor(m.entityType, m.entityId, this.db),
        status: "official_record",
        entityType: m.entityType,
        relatedLabel: labelFor(m.entityType, m.entityId, this.db).slice(0, 40),
      });
    }

    for (const r of [...this.db.reports]
      .sort((a, b) => byDateDesc(a.submittedAt, b.submittedAt))
      .slice(0, 8)) {
      items.push({
        id: `stream-rep-${r.id}`,
        date: r.submittedAt.slice(0, 10),
        kind: "Citizen report",
        title: r.title,
        summary: r.description.slice(0, 120) + (r.description.length > 120 ? "…" : ""),
        href: "/action#reports",
        status: r.verificationStatus,
        entityType: "report",
        relatedLabel: r.locationId
          ? labelFor("place", r.locationId, this.db).slice(0, 40)
          : "Citizen report",
      });
    }

    for (const c of [...this.db.claims].sort((a, b) => byDateDesc(a.date, b.date)).slice(0, 8)) {
      const person = c.personId ? this.db.people.find((p) => p.id === c.personId) : undefined;
      items.push({
        id: `stream-claim-${c.id}`,
        date: c.date,
        kind: c.kind.replace(/_/g, " "),
        title: c.statement.slice(0, 110) + (c.statement.length > 110 ? "…" : ""),
        summary: c.context.slice(0, 120) + (c.context.length > 120 ? "…" : ""),
        href: person ? `/people/${person.slug}#claims` : "/people",
        status: c.status,
        entityType: "claim",
        relatedLabel: person?.fullName ?? "Claim",
      });
    }

    const seen = new Set<string>();
    const deduped: PublicRecordItem[] = [];
    for (const item of items.sort((a, b) => byDateDesc(a.date, b.date))) {
      const key = `${item.href}::${item.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
      if (deduped.length >= limit) break;
    }
    return deduped;
  }

  related(entityType: EntityType, entityId: string): ThreadNode[] {
    const out: ThreadNode[] = [];
    for (const rel of this.db.relationships) {
      if (rel.fromType === entityType && rel.fromId === entityId) {
        out.push({
          type: rel.toType,
          id: rel.toId,
          label: labelFor(rel.toType, rel.toId, this.db),
          href: hrefFor(rel.toType, rel.toId, this.db),
          relationship: rel.relationshipType,
        });
      }
      if (rel.toType === entityType && rel.toId === entityId) {
        out.push({
          type: rel.fromType,
          id: rel.fromId,
          label: labelFor(rel.fromType, rel.fromId, this.db),
          href: hrefFor(rel.fromType, rel.fromId, this.db),
          relationship: `← ${rel.relationshipType}`,
        });
      }
    }
    return out;
  }

  /** Signature demo thread for the abandoned road project */
  signatureThread(): ThreadNode[] {
    const steps: { type: EntityType; id: string; relationship: string }[] = [
      { type: "problem", id: "prob-roads-ikeja", relationship: "start" },
      { type: "office", id: "office-lagos-works-comm", relationship: "responsible_office" },
      { type: "person", id: "person-adebayo", relationship: "office_holder" },
      { type: "project", id: "proj-allen-spur", relationship: "addressed_by" },
      { type: "money", id: "alloc-allen", relationship: "funded_by" },
      { type: "organization", id: "org-delta-roads", relationship: "contractor" },
      { type: "evidence", id: "ev-allen-photo-1", relationship: "evidence" },
      { type: "report", id: "report-allen-1", relationship: "citizen_report" },
      { type: "response", id: "resp-allen", relationship: "official_response" },
    ];
    return steps.map((s) => ({
      type: s.type,
      id: s.id,
      label: labelFor(s.type, s.id, this.db),
      href: hrefFor(s.type, s.id, this.db),
      relationship: s.relationship,
    }));
  }

  search(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return [] as { type: string; title: string; href: string; snippet: string }[];

    const results: { type: string; title: string; href: string; snippet: string; score: number }[] = [];

    const push = (type: string, title: string, href: string, snippet: string, hay: string) => {
      const h = hay.toLowerCase();
      if (!h.includes(q) && !q.split(/\s+/).every((w) => h.includes(w))) return;
      let score = 0;
      if (h.includes(q)) score += 10;
      q.split(/\s+/).forEach((w) => {
        if (h.includes(w)) score += 2;
      });
      results.push({ type, title, href, snippet, score });
    };

    for (const p of this.db.problems) {
      push("Problem", p.title, `/problems/${p.slug}`, p.description, `${p.title} ${p.description} ${p.category}`);
    }
    for (const p of this.db.projects) {
      push("Project", p.name, `/projects/${p.slug}`, p.description, `${p.name} ${p.description} ${p.status}`);
    }
    for (const p of this.db.people.filter((x) => x.isPublicPersonality)) {
      push("Person", p.fullName, `/people/${p.slug}`, p.bio, `${p.fullName} ${p.bio} ${p.aliases.join(" ")}`);
    }
    for (const o of this.db.offices) {
      push("Office", o.name, `/government/offices/${o.slug}`, o.mandate, `${o.name} ${o.title} ${o.mandate}`);
    }
    for (const i of this.db.institutions) {
      push(
        "Institution",
        i.name,
        `/government/institutions/${i.slug}`,
        i.description,
        `${i.name} ${i.description} ${i.mandate}`,
      );
    }
    for (const l of this.db.locations) {
      const href =
        l.type === "state"
          ? `/places/states/${l.slug}`
          : l.type === "lga"
            ? `/places/lgas/${l.slug}`
            : l.type === "ward"
              ? `/places/wards/${l.slug}`
              : l.type === "community"
                ? `/places/communities/${l.slug}`
                : "/places";
      push("Place", l.name, href, l.summary, `${l.name} ${l.summary}`);
    }
    for (const o of this.db.organizations) {
      push("Organization", o.name, `/organizations/${o.slug}`, o.mission, `${o.name} ${o.mission} ${o.description}`);
    }
    for (const a of this.db.allocations) {
      push("Money", a.program, `/money/${a.slug}`, a.gapNote ?? a.recipient, `${a.program} ${a.recipient} ${a.gapNote ?? ""}`);
    }
    for (const e of this.db.evidence) {
      push("Evidence", e.title, `/evidence/${e.id}`, e.description, `${e.title} ${e.description}`);
    }
    for (const ev of this.db.events) {
      const href = ev.type === "election" ? `/events/elections/${ev.slug}` : `/events/${ev.slug}`;
      push("Event", ev.title, href, ev.summary, `${ev.title} ${ev.summary}`);
    }
    for (const g of this.db.guidance) {
      push("Guidance", g.title, `/guidance/${g.slug}`, g.situation, `${g.title} ${g.situation} ${g.category}`);
    }

    // Relationship-aware boosts for signature queries
    if (q.includes("allen") || q.includes("abandoned road") || q.includes("ikeja road")) {
      results.forEach((r) => {
        if (r.href.includes("allen") || r.href.includes("ikeja") || r.href.includes("roads")) r.score += 20;
      });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 40);
  }

  formatNaira(amount: number): string {
    if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(2)}bn`;
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}m`;
    return `₦${amount.toLocaleString("en-NG")}`;
  }
}

export const store = new PublicRecordStore();
