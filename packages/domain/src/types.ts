export type VerificationStatus =
  | "verified"
  | "official_record"
  | "reported"
  | "unverified"
  | "disputed"
  | "corrected"
  | "ai_generated"
  | "insufficient_evidence"
  | "under_review"
  | "withdrawn";

export type GovernmentLevel = "federal" | "state" | "local";
export type InstitutionType =
  | "ministry"
  | "agency"
  | "commission"
  | "legislature"
  | "judiciary"
  | "executive"
  | "local_government"
  | "other";

export type LocationType =
  | "country"
  | "state"
  | "lga"
  | "ward"
  | "community"
  | "polling_unit";

export type ProjectStatus =
  | "planned"
  | "funded"
  | "started"
  | "in_progress"
  | "delayed"
  | "abandoned"
  | "completed"
  | "cancelled";

export type ReportStatus =
  | "submitted"
  | "screened"
  | "under_review"
  | "published"
  | "connected"
  | "responded"
  | "resolved"
  | "archived";

export type ClaimKind =
  | "official_record"
  | "public_statement"
  | "claim"
  | "allegation"
  | "rumour"
  | "promise";

export type EntityType =
  | "person"
  | "office"
  | "institution"
  | "problem"
  | "project"
  | "money"
  | "place"
  | "organization"
  | "evidence"
  | "report"
  | "response"
  | "event"
  | "claim"
  | "source";

export interface Source {
  id: string;
  type: string;
  title: string;
  publisher: string;
  url?: string;
  publicationDate: string;
  description: string;
  reliability: "high" | "medium" | "low";
}

export interface Location {
  id: string;
  slug: string;
  name: string;
  type: LocationType;
  parentId?: string;
  lat: number;
  lng: number;
  summary: string;
  population?: string;
}

export interface PersonImageCredit {
  photographer: string;
  license: string;
  sourceUrl: string;
  coverPhotographer?: string;
  coverLicense?: string;
  coverSourceUrl?: string;
}

export interface PersonRelatedItem {
  label: string;
  href: string;
  kind: string;
  description: string;
}

export interface Person {
  id: string;
  slug: string;
  fullName: string;
  aliases: string[];
  bio: string;
  photoInitials: string;
  photoUrl?: string;
  coverUrl?: string;
  imageCredit?: PersonImageCredit;
  relatedItems?: PersonRelatedItem[];
  isPublicPersonality: boolean;
  classification?: string;
  locationIds: string[];
}

export interface Institution {
  id: string;
  slug: string;
  name: string;
  type: InstitutionType;
  level: GovernmentLevel;
  parentId?: string;
  mandate: string;
  description: string;
  website?: string;
  locationId?: string;
  foiPortalUrl?: string;
  contactNotes?: string;
  transparencyNotes?: string;
}

export interface Office {
  id: string;
  slug: string;
  institutionId: string;
  name: string;
  title: string;
  mandate: string;
  responsibilities: string[];
  level: GovernmentLevel;
  foiPortalUrl?: string;
  contactNotes?: string;
  transparencyNotes?: string;
}

export interface OfficeTenure {
  id: string;
  personId: string;
  officeId: string;
  startDate: string;
  endDate?: string;
  appointmentType: string;
  sourceId?: string;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  urgency: "low" | "medium" | "high";
  status: string;
  locationIds: string[];
  officeIds: string[];
  firstReportedAt: string;
  verificationStatus: VerificationStatus;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  problemId?: string;
  locationId: string;
  responsibleOfficeId: string;
  contractorId?: string;
  fundingSource: string;
  approvedAmount: number;
  releasedAmount: number;
  reportedSpend: number;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  statusHistory: { status: ProjectStatus; effectiveAt: string; reason: string }[];
  verificationStatus: VerificationStatus;
  /** When true, eligible for home featured project tiles. */
  featured?: boolean;
}

export interface Budget {
  id: string;
  slug: string;
  title: string;
  governmentLevel: GovernmentLevel;
  institutionId: string;
  fiscalYear: number;
  amount: number;
  documentSourceId?: string;
  description: string;
}

export interface Allocation {
  id: string;
  slug: string;
  budgetId: string;
  program: string;
  amount: number;
  recipient: string;
  projectId?: string;
  sourceId?: string;
  released: boolean;
  releasedAmount: number;
  gapNote?: string;
}

export interface Contract {
  id: string;
  slug: string;
  title: string;
  allocationId: string;
  projectId: string;
  contractorName: string;
  amount: number;
  awardedAt: string;
  status: string;
  sourceId?: string;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  type: string;
  mission: string;
  description: string;
  registrationNumber?: string;
  website?: string;
  locationId: string;
  problemIds: string[];
  projectIds: string[];
  fundingReceived: number;
  fundingSpent: number;
  transparencyNotes: string;
  /** Platform transparency process — NGOs earn trust by publishing spend. */
  vettingStatus?: "none" | "platform_vetted";
  spendLineItems?: {
    label: string;
    amount: number;
    period: string;
    sourceId?: string;
  }[];
}

export interface Evidence {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string;
  sourceId: string;
  capturedAt: string;
  locationId?: string;
  verificationStatus: VerificationStatus;
  relatedEntityType: EntityType;
  relatedEntityId: string;
  fileLabel?: string;
  lastReviewedAt?: string;
  lastReviewedBy?: string;
}

export interface Claim {
  id: string;
  slug: string;
  statement: string;
  kind: ClaimKind;
  personId?: string;
  date: string;
  context: string;
  status: VerificationStatus;
  evidenceIds: string[];
  responseIds: string[];
  lastReviewedAt?: string;
  lastReviewedBy?: string;
}

export interface CitizenReport {
  id: string;
  slug: string;
  title: string;
  description: string;
  locationId: string;
  capturedAt: string;
  submittedAt: string;
  status: ReportStatus;
  verificationStatus: VerificationStatus;
  problemId?: string;
  projectId?: string;
  officeId?: string;
  personId?: string;
  evidenceIds: string[];
  privacyLevel: "exact" | "community" | "lga" | "state" | "hidden";
}

export interface OfficialResponse {
  id: string;
  slug: string;
  statement: string;
  respondingInstitutionId: string;
  respondingPersonId?: string;
  targetType: EntityType;
  targetId: string;
  publishedAt: string;
  sourceId?: string;
}

export interface MemoryEvent {
  id: string;
  eventType: string;
  entityType: EntityType;
  entityId: string;
  date: string;
  description: string;
  sourceId?: string;
}

export interface EntityRelationship {
  id: string;
  fromType: EntityType;
  fromId: string;
  relationshipType: string;
  toType: EntityType;
  toId: string;
  sourceId?: string;
  confidence: number;
}

export interface CivicEvent {
  id: string;
  slug: string;
  title: string;
  type: "election" | "hearing" | "announcement" | "crisis" | "other";
  date: string;
  locationId: string;
  summary: string;
  status: string;
}

export interface ElectionResult {
  id: string;
  electionId: string;
  pollingUnitId: string;
  candidate: string;
  party: string;
  officialVotes?: number;
  observerVotes?: number;
  sourceOfficialId?: string;
  sourceObserverId?: string;
}

export interface ResultDiscrepancy {
  id: string;
  electionId: string;
  pollingUnitId: string;
  description: string;
  officialTotal: number;
  observerTotal: number;
  difference: number;
  status: "surfaced" | "under_review" | "explained";
  note: string;
}

export interface GuidanceTopic {
  id: string;
  slug: string;
  title: string;
  category: string;
  situation: string;
  rights: string[];
  evidenceToKeep: string[];
  responsibleOfficeIds: string[];
  reportPaths: string[];
  organizationIds: string[];
  nextSteps: string[];
}

export interface CivicActionRecord {
  id: string;
  type: "follow" | "foi" | "contact" | "support" | "volunteer" | "challenge";
  entityType: EntityType;
  entityId: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  userLabel: string;
  /** Linked evidence for FOI responses etc. */
  evidenceIds?: string[];
}

export interface PublicRecordItem {
  id: string;
  date: string;
  kind: string;
  title: string;
  summary: string;
  href: string;
  status: VerificationStatus;
  /** Optional entity family for stream tinting / chips. */
  entityType?: EntityType;
  /** Short L3 related label shown on stream rows. */
  relatedLabel?: string;
}

export interface SeedDatabase {
  sources: Source[];
  locations: Location[];
  people: Person[];
  institutions: Institution[];
  offices: Office[];
  tenures: OfficeTenure[];
  problems: Problem[];
  projects: Project[];
  budgets: Budget[];
  allocations: Allocation[];
  contracts: Contract[];
  organizations: Organization[];
  evidence: Evidence[];
  claims: Claim[];
  reports: CitizenReport[];
  responses: OfficialResponse[];
  memory: MemoryEvent[];
  relationships: EntityRelationship[];
  events: CivicEvent[];
  electionResults: ElectionResult[];
  discrepancies: ResultDiscrepancy[];
  guidance: GuidanceTopic[];
  actions: CivicActionRecord[];
  publicRecord: PublicRecordItem[];
}
