export type DemoReport = {
  id: string;
  title: string;
  description: string;
  location: string;
  createdAt: string;
  status: string;
  user: string;
  kind?: string;
  officeId?: string;
  personId?: string;
  problemId?: string;
  electionId?: string;
  pollingUnitId?: string;
  fileLabel?: string;
  mediaType?: string;
};

export type RecordPatch = {
  claims: Record<string, { status?: string; lastReviewedAt?: string; lastReviewedBy?: string }>;
  evidence: Record<string, { verificationStatus?: string; lastReviewedAt?: string; lastReviewedBy?: string }>;
};

export function getDemoReportsStore() {
  const globalStore = globalThis as unknown as { __demoReports?: DemoReport[] };
  if (!globalStore.__demoReports) globalStore.__demoReports = [];
  return globalStore;
}

export function getRecordPatchStore(): RecordPatch {
  const globalStore = globalThis as unknown as { __recordPatch?: RecordPatch };
  if (!globalStore.__recordPatch) {
    globalStore.__recordPatch = { claims: {}, evidence: {} };
  }
  return globalStore.__recordPatch;
}
