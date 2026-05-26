import type { ProgressSnapshot, Report } from "./report-types";

export type Project = {
  id: string;
  name: string;
  projectType: string | null;
  location: string | null;
  plannedDurationDays: number | null;
  goalSummary: string;
  projectPlanFileName: string | null;
  projectPlanMimeType: string | null;
  projectPlanUploadedAt: string | null;
  hasProjectPlan: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectOption = {
  id: string;
  name: string;
};

export type ProjectSummary = Project &
  ProgressSnapshot & {
    latestReportId: string | null;
    latestReportDate: string | null;
    latestReportSummary: string | null;
    reportCount: number;
  };

export type ProjectDetail = ProjectSummary & {
  recentReports: Report[];
};

export type CreateProjectInput = {
  name: string;
  projectType: string;
  location: string;
  plannedDurationDays: number;
  goalSummary: string;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;
