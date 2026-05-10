import type { CreateReportInput, Report } from "./report-types";

type ProjectShape = {
  id: string;
  name: string;
  goalSummary: string;
};

type ReportShape = {
  id: string;
  date: Date;
  summary: string;
  plannedProgressPct: number | null;
  actualProgressPct: number | null;
  completionPct: number | null;
};

type ReportWithProjectShape = ReportShape & {
  project: ProjectShape;
};

export function formatReportDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatProgressValue(value: number | null) {
  return value === null ? "N/A" : `${value}%`;
}

export function calculateVariance(
  plannedProgressPct: number | null,
  actualProgressPct: number | null
) {
  if (plannedProgressPct === null || actualProgressPct === null) {
    return null;
  }

  return actualProgressPct - plannedProgressPct;
}

export function serializeReport(report: ReportWithProjectShape): Report {
  return {
    id: report.id,
    projectId: report.project.id,
    projectName: report.project.name,
    projectGoalSummary: report.project.goalSummary,
    date: report.date.toISOString().slice(0, 10),
    summary: report.summary,
    plannedProgressPct: report.plannedProgressPct,
    actualProgressPct: report.actualProgressPct,
    completionPct: report.completionPct,
    variancePct: calculateVariance(
      report.plannedProgressPct,
      report.actualProgressPct
    )
  };
}

export function serializeProjectScopedReport(
  project: ProjectShape,
  report: ReportShape
) {
  return serializeReport({
    ...report,
    project
  });
}

export function toReportCreateData(input: CreateReportInput) {
  return {
    projectId: input.projectId,
    date: new Date(`${input.date}T00:00:00.000Z`),
    summary: input.summary.trim(),
    plannedProgressPct: input.plannedProgressPct,
    actualProgressPct: input.actualProgressPct,
    completionPct: input.completionPct
  };
}
