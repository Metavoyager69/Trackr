import type {
  CreateProjectInput,
  ProjectDetail,
  ProjectSummary,
  UpdateProjectInput
} from "./project-types";
import {
  calculateVariance,
  serializeProjectScopedReport
} from "./report-utils";

type ProjectShape = {
  id: string;
  name: string;
  projectType: string | null;
  location: string | null;
  plannedDurationDays: number | null;
  goalSummary: string;
  projectPlanFileName: string | null;
  projectPlanMimeType: string | null;
  projectPlanUploadedAt: Date | null;
  projectPlanFileData?: Uint8Array | Buffer | null;
  createdAt: Date;
  updatedAt: Date;
};

type ReportShape = {
  id: string;
  date: Date;
  summary: string | null;
  workersOnSite: number;
  plannedProgressPct: number | null;
  actualProgressPct: number | null;
  completionPct: number | null;
  createdAt: Date;
  workItems: Array<{
    id: string;
    contractor: string;
    workDescription: string;
    engineerName: string;
    location: string;
  }>;
};

type ProjectWithLatestReportShape = ProjectShape & {
  reports: ReportShape[];
  _count: {
    reports: number;
  };
};

type ProjectWithReportsShape = ProjectShape & {
  reports: ReportShape[];
};

export function serializeProjectSummary(
  project: ProjectWithLatestReportShape
): ProjectSummary {
  const latestReport = project.reports[0] ?? null;

  return {
    id: project.id,
    name: project.name,
    projectType: project.projectType,
    location: project.location,
    plannedDurationDays: project.plannedDurationDays,
    goalSummary: project.goalSummary,
    projectPlanFileName: project.projectPlanFileName,
    projectPlanMimeType: project.projectPlanMimeType,
    projectPlanUploadedAt: project.projectPlanUploadedAt?.toISOString() ?? null,
    hasProjectPlan: Boolean(project.projectPlanFileName),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    latestReportId: latestReport?.id ?? null,
    latestReportDate: latestReport?.date.toISOString().slice(0, 10) ?? null,
    latestReportSummary: latestReport?.summary ?? null,
    plannedProgressPct: latestReport?.plannedProgressPct ?? null,
    actualProgressPct: latestReport?.actualProgressPct ?? null,
    completionPct: latestReport?.completionPct ?? null,
    variancePct: calculateVariance(
      latestReport?.plannedProgressPct ?? null,
      latestReport?.actualProgressPct ?? null
    ),
    reportCount: project._count.reports
  };
}

export function serializeProjectDetail(
  project: ProjectWithReportsShape
): ProjectDetail {
  const recentReports = project.reports.map((report) =>
    serializeProjectScopedReport(project, report)
  );
  const latestReport = recentReports[0] ?? null;

  return {
    id: project.id,
    name: project.name,
    projectType: project.projectType,
    location: project.location,
    plannedDurationDays: project.plannedDurationDays,
    goalSummary: project.goalSummary,
    projectPlanFileName: project.projectPlanFileName,
    projectPlanMimeType: project.projectPlanMimeType,
    projectPlanUploadedAt: project.projectPlanUploadedAt?.toISOString() ?? null,
    hasProjectPlan: Boolean(project.projectPlanFileName),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    latestReportId: latestReport?.id ?? null,
    latestReportDate: latestReport?.date ?? null,
    latestReportSummary: latestReport?.summary ?? null,
    plannedProgressPct: latestReport?.plannedProgressPct ?? null,
    actualProgressPct: latestReport?.actualProgressPct ?? null,
    completionPct: latestReport?.completionPct ?? null,
    variancePct: latestReport?.variancePct ?? null,
    reportCount: recentReports.length,
    recentReports
  };
}

export function toProjectCreateData(input: CreateProjectInput) {
  return {
    name: input.name.trim(),
    projectType: input.projectType.trim(),
    location: input.location.trim(),
    plannedDurationDays: input.plannedDurationDays,
    goalSummary: input.goalSummary.trim()
  };
}

export function toProjectUpdateData(input: UpdateProjectInput) {
  const data: {
    name?: string;
    projectType?: string;
    location?: string;
    plannedDurationDays?: number;
    goalSummary?: string;
  } = {};

  if (input.name !== undefined) {
    data.name = input.name.trim();
  }

  if (input.goalSummary !== undefined) {
    data.goalSummary = input.goalSummary.trim();
  }

  if (input.projectType !== undefined) {
    data.projectType = input.projectType.trim();
  }

  if (input.location !== undefined) {
    data.location = input.location.trim();
  }

  if (input.plannedDurationDays !== undefined) {
    data.plannedDurationDays = input.plannedDurationDays;
  }

  return data;
}
