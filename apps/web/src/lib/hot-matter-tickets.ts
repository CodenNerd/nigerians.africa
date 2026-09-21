import type { MatterStatus } from "@nigeria-for-nigerians/domain";

export type HotMatterTicket = {
  key: string;
  title: string;
  href: string;
  reportedBy: string;
  followedUpBy: string;
  progress: string;
  status: MatterStatus;
  location: string;
  evidenceCount: number;
};

export const MATTER_STATUS_TONE: Record<
  MatterStatus,
  { bar: string; chip: string; label: string }
> = {
  published: {
    bar: "bg-civic-amber",
    chip: "border-civic-amber/30 bg-civic-amberSoft text-civic-amber",
    label: "Intake",
  },
  under_review: {
    bar: "bg-civic-amber",
    chip: "border-civic-amber/30 bg-civic-amberSoft text-civic-amber",
    label: "Screening",
  },
  accepted: {
    bar: "bg-civic-green",
    chip: "border-civic-green/30 bg-civic-greenSoft text-civic-green",
    label: "Accepted",
  },
  filed: {
    bar: "bg-civic-blue",
    chip: "border-civic-blue/30 bg-civic-blueSoft text-civic-blue",
    label: "Filed",
  },
  in_hearing: {
    bar: "bg-civic-red",
    chip: "border-civic-red/30 bg-civic-redSoft text-civic-red",
    label: "In hearing",
  },
  closed_won: {
    bar: "bg-civic-green",
    chip: "border-civic-green/30 bg-civic-greenSoft text-civic-green",
    label: "Closed",
  },
  closed_lost: {
    bar: "bg-civic-slate",
    chip: "border-paper-border bg-paper text-ink-faint",
    label: "Closed",
  },
  closed_withdrawn: {
    bar: "bg-civic-slate",
    chip: "border-paper-border bg-paper text-ink-faint",
    label: "Withdrawn",
  },
  archived: {
    bar: "bg-civic-slate",
    chip: "border-paper-border bg-paper text-ink-faint",
    label: "Archived",
  },
};

export function matterProgressLabel(status: MatterStatus): string {
  return MATTER_STATUS_TONE[status].label;
}
