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
  goalSummary: string;
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
    goalSummary: project.goalSummary,
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
    goalSummary: project.goalSummary,
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
    goalSummary: input.goalSummary.trim()
  };
}

export function toProjectUpdateData(input: UpdateProjectInput) {
  const data: {
    name?: string;
    goalSummary?: string;
  } = {};

  if (input.name !== undefined) {
    data.name = input.name.trim();
  }

  if (input.goalSummary !== undefined) {
    data.goalSummary = input.goalSummary.trim();
  }

  return data;
}
