/** Contribution entity types — civic dossiers that host a public contribution space. */
export const CONTRIBUTION_ENTITY_TYPES = [
  "organization",
  "person",
  "problem",
  "project",
  "matter",
  "place",
  "office",
  "institution",
  "scheme",
  "evidence",
  "money",
  "event",
  "budget",
  "candidate",
  "guidance",
] as const;

export type ContributionEntityType = (typeof CONTRIBUTION_ENTITY_TYPES)[number];

export function isContributionEntityType(value: string): value is ContributionEntityType {
  return (CONTRIBUTION_ENTITY_TYPES as readonly string[]).includes(value);
}

export type ContributionStatus = "published" | "held" | "removed";

export type ArgumentSide = "for" | "against" | "nuance";

export type ArgumentReactionKind = "agree" | "disagree";

export type SocialPlatform = "x" | "facebook" | "instagram" | "youtube" | "tiktok" | "other";

export type ContributorIdentity = {
  displayName: string;
  email: string;
  userId?: string | null;
};

export type ContributionAuthor = {
  id: string;
  displayName: string;
  email: string | null;
  userId: string | null;
  createdAt: string;
};

export type ArgumentRecord = {
  id: string;
  entityType: string;
  entityId: string;
  authorId: string;
  authorDisplayName: string;
  side: ArgumentSide;
  title: string;
  body: string;
  evidenceUrl: string | null;
  status: ContributionStatus;
  createdAt: string;
  agreeCount: number;
  disagreeCount: number;
  replies: ArgumentReplyRecord[];
};

export type ArgumentReplyRecord = {
  id: string;
  argumentId: string;
  authorId: string;
  authorDisplayName: string;
  body: string;
  status: ContributionStatus;
  createdAt: string;
};

export type PollRecord = {
  id: string;
  entityType: string;
  entityId: string;
  authorId: string;
  authorDisplayName: string;
  question: string;
  status: ContributionStatus;
  createdAt: string;
  options: PollOptionRecord[];
};

export type PollOptionRecord = {
  id: string;
  pollId: string;
  label: string;
  sortOrder: number;
  voteCount: number;
};

export type ContributionPageRecord = {
  id: string;
  entityType: string;
  entityId: string;
  authorId: string;
  authorDisplayName: string;
  title: string;
  body: string;
  status: ContributionStatus;
  createdAt: string;
};

export type CommentRecord = {
  id: string;
  entityType: string;
  entityId: string;
  authorId: string;
  authorDisplayName: string;
  body: string;
  parentId: string | null;
  status: ContributionStatus;
  createdAt: string;
};

export type SocialPostRecord = {
  id: string;
  entityType: string;
  entityId: string;
  authorId: string;
  authorDisplayName: string;
  platform: SocialPlatform;
  url: string;
  title: string;
  snippet: string | null;
  status: ContributionStatus;
  createdAt: string;
};

export type EntityContributions = {
  arguments: ArgumentRecord[];
  polls: PollRecord[];
  pages: ContributionPageRecord[];
  comments: CommentRecord[];
  social: SocialPostRecord[];
};

export type ContributionsTab =
  | "arguments"
  | "polls"
  | "pages"
  | "comments"
  | "social";
