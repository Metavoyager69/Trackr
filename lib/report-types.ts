export type ProgressSnapshot = {
  plannedProgressPct: number | null;
  actualProgressPct: number | null;
  completionPct: number | null;
  variancePct: number | null;
};

export type ReportWorkItem = {
  id: string;
  contractor: string;
  workDescription: string;
  engineerName: string;
  location: string;
};

export type Report = ProgressSnapshot & {
  id: string;
  projectId: string;
  projectName: string;
  projectGoalSummary: string;
  date: string;
  summary: string | null;
  workersOnSite: number;
  contractorsOnSiteCount: number;
  workItems: ReportWorkItem[];
};

export type CreateReportWorkItemInput = {
  contractor: string;
  workDescription: string;
  engineerName: string;
  location: string;
};

export type CreateReportInput = {
  projectId: string;
  date: string;
  summary?: string;
  workersOnSite: number;
  plannedProgressPct: number;
  actualProgressPct: number;
  completionPct: number;
  workItems: CreateReportWorkItemInput[];
};

export type UpdateReportInput = Omit<Partial<CreateReportInput>, "summary"> & {
  summary?: string | null;
};
