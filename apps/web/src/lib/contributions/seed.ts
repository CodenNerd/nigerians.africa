import type {
  ArgumentRecord,
  CommentRecord,
  ContributionPageRecord,
  EntityContributions,
  PollRecord,
  SocialPostRecord,
} from "./types";

const empty = (): EntityContributions => ({
  arguments: [],
  polls: [],
  pages: [],
  comments: [],
  social: [],
});

/** Seeded public contributions for demo entities (published only). */
export function seedContributionsFor(
  entityType: string,
  entityId: string,
): EntityContributions {
  const key = `${entityType}:${entityId}`;
  return SEED[key] ? structuredClone(SEED[key]) : empty();
}

const SEED: Record<string, EntityContributions> = {
  "project:proj-allen-spur": {
    arguments: [
      {
        id: "arg-allen-1",
        entityType: "project",
        entityId: "proj-allen-spur",
        authorId: "cauth-seed-ada",
        authorDisplayName: "Ada O.",
        side: "against",
        title: "Abandonment is the accurate label",
        body: "Ninety days without visible works, and the payment dispute note matches what residents have photographed. Calling it delayed softens the record.",
        evidenceUrl: null,
        status: "published",
        createdAt: "2025-06-12T10:00:00.000Z",
        agreeCount: 14,
        disagreeCount: 3,
        replies: [
          {
            id: "argrep-allen-1a",
            argumentId: "arg-allen-1",
            authorId: "cauth-seed-tunde",
            authorDisplayName: "Tunde K.",
            body: "Agree on the photos — but the contractor still claims materials are on site. Worth separating stoppage from legal abandonment.",
            status: "published",
            createdAt: "2025-06-12T14:20:00.000Z",
          },
        ],
      },
      {
        id: "arg-allen-2",
        entityType: "project",
        entityId: "proj-allen-spur",
        authorId: "cauth-seed-chioma",
        authorDisplayName: "Chioma E.",
        side: "nuance",
        title: "Released funds ≠ completed stretch",
        body: "The money trail shows release without matching progress. That is a governance problem even if some base course was laid.",
        evidenceUrl: null,
        status: "published",
        createdAt: "2025-06-18T09:30:00.000Z",
        agreeCount: 9,
        disagreeCount: 1,
        replies: [],
      },
      {
        id: "arg-allen-3",
        entityType: "project",
        entityId: "proj-allen-spur",
        authorId: "cauth-seed-ibrahim",
        authorDisplayName: "Ibrahim S.",
        side: "for",
        title: "Seasonal pause, not abandonment",
        body: "Works often pause in the rains. Without an official termination notice, abandoned may overstate the case.",
        evidenceUrl: null,
        status: "published",
        createdAt: "2025-06-20T16:00:00.000Z",
        agreeCount: 4,
        disagreeCount: 11,
        replies: [],
      },
    ],
    polls: [
      {
        id: "poll-allen-1",
        entityType: "project",
        entityId: "proj-allen-spur",
        authorId: "cauth-seed-ada",
        authorDisplayName: "Ada O.",
        question: "Should this project stay marked abandoned on the public record?",
        status: "published",
        createdAt: "2025-06-15T11:00:00.000Z",
        options: [
          { id: "pollopt-allen-1a", pollId: "poll-allen-1", label: "Yes — keep abandoned", sortOrder: 0, voteCount: 42 },
          { id: "pollopt-allen-1b", pollId: "poll-allen-1", label: "Mark delayed instead", sortOrder: 1, voteCount: 18 },
          { id: "pollopt-allen-1c", pollId: "poll-allen-1", label: "Need more evidence", sortOrder: 2, voteCount: 9 },
        ],
      },
    ],
    pages: [
      {
        id: "cpage-allen-1",
        entityType: "project",
        entityId: "proj-allen-spur",
        authorId: "cauth-seed-chioma",
        authorDisplayName: "Chioma E.",
        title: "What residents told monitors on the Allen spur",
        body: "Over three weekends, community monitors walked the stretch and logged drainage gaps, unfinished asphalt, and idle equipment. This note summarises those walks for anyone reading the project dossier.",
        status: "published",
        createdAt: "2025-06-10T08:00:00.000Z",
      },
    ],
    comments: [
      {
        id: "cmt-allen-1",
        entityType: "project",
        entityId: "proj-allen-spur",
        authorId: "cauth-seed-tunde",
        authorDisplayName: "Tunde K.",
        body: "Useful to see the money figures next to the status history. The jump to abandoned in April matches what we saw on the ground.",
        parentId: null,
        status: "published",
        createdAt: "2025-06-11T12:00:00.000Z",
      },
      {
        id: "cmt-allen-2",
        entityType: "project",
        entityId: "proj-allen-spur",
        authorId: "cauth-seed-ada",
        authorDisplayName: "Ada O.",
        body: "Has anyone filed FOI on the payment dispute letter?",
        parentId: null,
        status: "published",
        createdAt: "2025-06-13T17:45:00.000Z",
      },
    ],
    social: [
      {
        id: "soc-allen-1",
        entityType: "project",
        entityId: "proj-allen-spur",
        authorId: "cauth-seed-ibrahim",
        authorDisplayName: "Ibrahim S.",
        platform: "x",
        url: "https://example.com/x/allen-spur-thread",
        title: "Thread: photos from the Allen Avenue spur (June)",
        snippet: "Public thread collecting roadside photos — linked here as a social pointer, not as verified evidence.",
        status: "published",
        createdAt: "2025-06-14T20:00:00.000Z",
      },
    ],
  },

  "organization:org-tracka": {
    arguments: [
      {
        id: "arg-tracka-1",
        entityType: "organization",
        entityId: "org-tracka",
        authorId: "cauth-seed-ada",
        authorDisplayName: "Ada O.",
        side: "for",
        title: "Spend lines earn the vetted mark",
        body: "Publishing programme spend is rare. That transparency process is exactly what the vetted badge should signal — not endorsement of every outcome.",
        evidenceUrl: null,
        status: "published",
        createdAt: "2025-05-02T10:00:00.000Z",
        agreeCount: 7,
        disagreeCount: 0,
        replies: [],
      },
    ],
    polls: [
      {
        id: "poll-tracka-1",
        entityType: "organization",
        entityId: "org-tracka",
        authorId: "cauth-seed-chioma",
        authorDisplayName: "Chioma E.",
        question: "Is the published spend breakdown clear enough for donors?",
        status: "published",
        createdAt: "2025-05-08T09:00:00.000Z",
        options: [
          { id: "pollopt-tracka-1a", pollId: "poll-tracka-1", label: "Clear", sortOrder: 0, voteCount: 21 },
          { id: "pollopt-tracka-1b", pollId: "poll-tracka-1", label: "Needs more line detail", sortOrder: 1, voteCount: 15 },
          { id: "pollopt-tracka-1c", pollId: "poll-tracka-1", label: "Not sure", sortOrder: 2, voteCount: 6 },
        ],
      },
    ],
    pages: [
      {
        id: "cpage-tracka-1",
        entityType: "organization",
        entityId: "org-tracka",
        authorId: "cauth-seed-tunde",
        authorDisplayName: "Tunde K.",
        title: "How Civic Track trains community monitors",
        body: "A short field note on workshop formats used in Lagos — useful context when reading the organisation funding lines for training spend.",
        status: "published",
        createdAt: "2025-05-01T12:00:00.000Z",
      },
    ],
    comments: [
      {
        id: "cmt-tracka-1",
        entityType: "organization",
        entityId: "org-tracka",
        authorId: "cauth-seed-ibrahim",
        authorDisplayName: "Ibrahim S.",
        body: "Appreciate the income vs spend cards up top. Makes the rest of the dossier easier to scan.",
        parentId: null,
        status: "published",
        createdAt: "2025-05-03T08:30:00.000Z",
      },
    ],
    social: [
      {
        id: "soc-tracka-1",
        entityType: "organization",
        entityId: "org-tracka",
        authorId: "cauth-seed-ada",
        authorDisplayName: "Ada O.",
        platform: "youtube",
        url: "https://example.com/youtube/civic-track-demo",
        title: "Demo walkthrough of monitor training",
        snippet: "Community-submitted pointer to a public video.",
        status: "published",
        createdAt: "2025-05-04T15:00:00.000Z",
      },
    ],
  },

  "matter:matter-checkpoint-ikeja": {
    arguments: [
      {
        id: "arg-mnb-1",
        entityType: "matter",
        entityId: "matter-checkpoint-ikeja",
        authorId: "cauth-seed-chioma",
        authorDisplayName: "Chioma E.",
        side: "nuance",
        title: "Process status is not a verdict",
        body: "Filed or in hearing describes NGO process. Readers should not treat pipeline stage as a finding of guilt.",
        evidenceUrl: null,
        status: "published",
        createdAt: "2025-07-01T11:00:00.000Z",
        agreeCount: 12,
        disagreeCount: 2,
        replies: [],
      },
    ],
    polls: [
      {
        id: "poll-mnb-1",
        entityType: "matter",
        entityId: "matter-checkpoint-ikeja",
        authorId: "cauth-seed-ada",
        authorDisplayName: "Ada O.",
        question: "Is the evidence strip on this matter clear enough for the public?",
        status: "published",
        createdAt: "2025-07-02T10:00:00.000Z",
        options: [
          { id: "pollopt-mnb-1a", pollId: "poll-mnb-1", label: "Clear", sortOrder: 0, voteCount: 19 },
          { id: "pollopt-mnb-1b", pollId: "poll-mnb-1", label: "Needs more context", sortOrder: 1, voteCount: 11 },
        ],
      },
    ],
    pages: [
      {
        id: "cpage-mnb-1",
        entityType: "matter",
        entityId: "matter-checkpoint-ikeja",
        authorId: "cauth-seed-tunde",
        authorDisplayName: "Tunde K.",
        title: "Reading Make Nigeria Better without rushing to judgment",
        body: "A short explainer for neighbours who see a matter card and assume the platform has decided guilt. It has not.",
        status: "published",
        createdAt: "2025-07-01T09:00:00.000Z",
      },
    ],
    comments: [
      {
        id: "cmt-mnb-1",
        entityType: "matter",
        entityId: "matter-checkpoint-ikeja",
        authorId: "cauth-seed-ibrahim",
        authorDisplayName: "Ibrahim S.",
        body: "Good that the NGO partner is named. Helps people know who is carrying the process.",
        parentId: null,
        status: "published",
        createdAt: "2025-07-03T13:00:00.000Z",
      },
    ],
    social: [
      {
        id: "soc-mnb-1",
        entityType: "matter",
        entityId: "matter-checkpoint-ikeja",
        authorId: "cauth-seed-ada",
        authorDisplayName: "Ada O.",
        platform: "facebook",
        url: "https://example.com/facebook/ikeja-checkpoint-discussion",
        title: "Neighbourhood discussion post (public)",
        snippet: "Submitted as a social pointer — not platform verification.",
        status: "published",
        createdAt: "2025-07-04T18:00:00.000Z",
      },
    ],
  },
};

export type SeedMaps = {
  arguments: ArgumentRecord[];
  polls: PollRecord[];
  pages: ContributionPageRecord[];
  comments: CommentRecord[];
  social: SocialPostRecord[];
};

/** Flatten all seed rows for memory-store bootstrap. */
export function allSeedContributions(): SeedMaps {
  const out: SeedMaps = {
    arguments: [],
    polls: [],
    pages: [],
    comments: [],
    social: [],
  };
  for (const bundle of Object.values(SEED)) {
    out.arguments.push(...structuredClone(bundle.arguments));
    out.polls.push(...structuredClone(bundle.polls));
    out.pages.push(...structuredClone(bundle.pages));
    out.comments.push(...structuredClone(bundle.comments));
    out.social.push(...structuredClone(bundle.social));
  }
  return out;
}
