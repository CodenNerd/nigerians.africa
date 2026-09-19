import type {
  Allocation,
  EntityRelationship,
  Evidence,
  MemoryEvent,
  Problem,
  Project,
  Source,
} from "@nigeria-for-nigerians/domain";
import { fetchAndCache } from "../lib/fetch";
import type { AdapterResult } from "../lib/staging";

/**
 * Wave 4 — One real, well-documented civic vertical (Abuja / FCT) that does not
 * collide with the handcrafted Allen Avenue Lagos demo.
 *
 * Case: Abuja light rail / rail mass transit public infrastructure — documented via
 * Federal Ministry / NRC / publicly reported project pages. We fetch public URLs
 * for provenance and emit a linked problem→office→project→money→evidence thread
 * using only figures and claims that appear in those public materials or are
 * marked under_review.
 *
 * Primary public documentation often referenced:
 * - https://www.nrc.gov.ng (Nigerian Railway Corporation)
 * - Wikipedia summary pages used only as discovery; canonical Source remains gov URLs
 */
const NRC_HOME = "https://www.nrc.gov.ng/";
const FCT_HOME = "https://www.fcda.gov.ng/";

export async function crawlVertical(runId: string): Promise<AdapterResult> {
  const startedAt = new Date().toISOString();
  const sourcesLog: AdapterResult["manifest"]["sources"] = [];
  const failures: string[] = [];
  const notes: string[] = [];

  for (const url of [NRC_HOME, FCT_HOME]) {
    try {
      const { meta, fromCache } = await fetchAndCache("vertical", url, {
        accept: "text/html,application/xhtml+xml",
        license: "government-publication",
      });
      sourcesLog.push({ url: meta.url, contentHash: meta.contentHash, fromCache });
    } catch (e) {
      sourcesLog.push({ url, error: e instanceof Error ? e.message : String(e) });
      failures.push(`${url}: ${e instanceof Error ? e.message : String(e)}`);
      notes.push(`Fetch failed for ${url}; provenance URL still recorded on Source.`);
    }
  }

  const srcNrc: Source = {
    id: "src-nrc-abuja-rail",
    type: "Government",
    title: "Nigerian Railway Corporation — public rail programmes",
    publisher: "Nigerian Railway Corporation",
    url: NRC_HOME,
    publicationDate: startedAt.slice(0, 10),
    description: "Official NRC web presence used as provenance for rail project thread.",
    reliability: "high",
  };

  const srcFct: Source = {
    id: "src-fcda-abuja",
    type: "Government",
    title: "Federal Capital Development Authority",
    publisher: "FCDA",
    url: FCT_HOME,
    publicationDate: startedAt.slice(0, 10),
    description: "FCT development authority public site — urban infrastructure context.",
    reliability: "high",
  };

  // Ensure we have an Abuja location id that places adapter also emits; use wd for FCT
  // Federal Capital Territory is Q509300 on Wikidata commonly — use stable crawl id
  const abuProblem: Problem = {
    id: "problem-abuja-mobility-gaps",
    slug: "abuja-urban-mobility-gaps",
    title: "Abuja urban mobility and rail mass-transit continuity",
    category: "Infrastructure",
    description:
      "Public documentation of Abuja rail / mass-transit programmes highlights continuity, funding, and service gaps for FCT urban mobility. This record links responsible federal rail institutions to documented project activity.",
    severity: "high",
    urgency: "medium",
    status: "open",
    locationIds: ["wd:Q1033"],
    officeIds: ["wd:Q500282"],
    firstReportedAt: "2018-01-01",
    verificationStatus: "under_review",
  };

  const project: Project = {
    id: "project-abuja-light-rail-crawl",
    slug: "abuja-rail-mass-transit-phase",
    name: "Abuja Rail Mass Transit (documented phase)",
    description:
      "Federal / FCT rail mass-transit programme for Abuja as publicly documented via NRC and related federal channels. Status and spend figures require document-level confirmation before treating as verified.",
    problemId: abuProblem.id,
    locationId: "wd:Q1033",
    responsibleOfficeId: "wd:Q500282",
    fundingSource: "Federal budget / counterpart funding (see sources)",
    approvedAmount: 0,
    releasedAmount: 0,
    reportedSpend: 0,
    startDate: "2018-01-01",
    expectedEndDate: "2027-12-31",
    status: "in_progress",
    statusHistory: [
      {
        status: "in_progress",
        effectiveAt: "2018-01-01",
        reason: "Public programme documentation indicates ongoing rail mass-transit work in FCT.",
      },
    ],
    verificationStatus: "under_review",
  };

  // No invented naira amounts — allocation amount 0 with gap note pointing to BOF/NRC docs
  const allocation: Allocation = {
    id: "alloc-abuja-rail-tracking",
    slug: "abuja-rail-funding-tracking",
    budgetId: "budget-fed-2024-crawl",
    program: "Abuja rail mass transit — funding trail (pending line-item extract)",
    amount: 0,
    recipient: "NRC / FCT rail programme",
    projectId: project.id,
    sourceId: srcNrc.id,
    released: false,
    releasedAmount: 0,
    gapNote:
      "Amount intentionally zero until a specific Appropriation / contract line is extracted from an official PDF. Do not invent figures.",
  };

  const evidence: Evidence[] = [
    {
      id: "ev-nrc-home",
      slug: "nrc-website-provenance",
      type: "Government Record",
      title: "NRC website capture",
      description: "Fetched NRC homepage as provenance for rail programme existence.",
      sourceId: srcNrc.id,
      capturedAt: startedAt.slice(0, 10),
      locationId: "wd:Q1033",
      verificationStatus: "under_review",
      relatedEntityType: "project",
      relatedEntityId: project.id,
      fileLabel: "nrc-html",
    },
    {
      id: "ev-fcda-home",
      slug: "fcda-website-provenance",
      type: "Government Record",
      title: "FCDA website capture",
      description: "Fetched FCDA homepage as FCT development context.",
      sourceId: srcFct.id,
      capturedAt: startedAt.slice(0, 10),
      locationId: "wd:Q1033",
      verificationStatus: "under_review",
      relatedEntityType: "problem",
      relatedEntityId: abuProblem.id,
      fileLabel: "fcda-html",
    },
  ];

  const relationships: EntityRelationship[] = [
    {
      id: "rel-problem-project-abuja-rail",
      fromType: "problem",
      fromId: abuProblem.id,
      relationshipType: "addressed_by",
      toType: "project",
      toId: project.id,
      sourceId: srcNrc.id,
      confidence: 0.7,
    },
    {
      id: "rel-project-money-abuja-rail",
      fromType: "project",
      fromId: project.id,
      relationshipType: "funded_via",
      toType: "money",
      toId: allocation.id,
      sourceId: srcNrc.id,
      confidence: 0.5,
    },
  ];

  const memory: MemoryEvent[] = [
    {
      id: "mem-abuja-rail-documented",
      eventType: "Project Start",
      entityType: "project",
      entityId: project.id,
      date: "2018-01-01",
      description: "Abuja rail mass-transit programme appears in public federal/NRC documentation.",
      sourceId: srcNrc.id,
    },
  ];

  notes.push(
    "Vertical uses real institutional URLs. Money amounts left at 0 until PDF line-items are extracted — per plan anti-invention rule.",
  );

  return {
    partial: {
      sources: [srcNrc, srcFct],
      problems: [abuProblem],
      projects: [project],
      allocations: [allocation],
      evidence,
      relationships,
      memory,
    },
    manifest: {
      runId,
      adapter: "vertical",
      startedAt,
      sources: sourcesLog,
      counts: {},
      failures,
      notes,
    },
  };
}
