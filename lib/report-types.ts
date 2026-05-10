export type ProgressSnapshot = {
  plannedProgressPct: number | null;
  actualProgressPct: number | null;
  completionPct: number | null;
  variancePct: number | null;
};

export type Report = ProgressSnapshot & {
  id: string;
  projectId: string;
  projectName: string;
  projectGoalSummary: string;
  date: string;
  summary: string;
};

export type CreateReportInput = {
  projectId: string;
  date: string;
  summary: string;
  plannedProgressPct: number;
  actualProgressPct: number;
  completionPct: number;
};
