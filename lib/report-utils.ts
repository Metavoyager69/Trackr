import type {
  CreateReportInput,
  Report,
  ReportWorkItem,
  UpdateReportInput
} from "./report-types";

type ProjectShape = {
  id: string;
  name: string;
  goalSummary: string;
};

type ReportShape = {
  id: string;
  date: Date;
  summary: string | null;
  workersOnSite: number;
  plannedProgressPct: number | null;
  actualProgressPct: number | null;
  completionPct: number | null;
  workItems: ReportWorkItemShape[];
};

type ReportWorkItemShape = {
  id: string;
  contractor: string;
  workDescription: string;
  engineerName: string;
  location: string;
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

export function serializeWorkItem(
  workItem: ReportWorkItemShape
): ReportWorkItem {
  return {
    id: workItem.id,
    contractor: workItem.contractor,
    workDescription: workItem.workDescription,
    engineerName: workItem.engineerName,
    location: workItem.location
  };
}

export function serializeReport(report: ReportWithProjectShape): Report {
  const workItems = report.workItems.map(serializeWorkItem);

  return {
    id: report.id,
    projectId: report.project.id,
    projectName: report.project.name,
    projectGoalSummary: report.project.goalSummary,
    date: report.date.toISOString().slice(0, 10),
    summary: report.summary,
    workersOnSite: report.workersOnSite,
    contractorsOnSiteCount: countDistinctContractors(workItems),
    workItems,
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
    summary: input.summary?.trim() ? input.summary.trim() : null,
    workersOnSite: input.workersOnSite,
    plannedProgressPct: input.plannedProgressPct,
    actualProgressPct: input.actualProgressPct,
    completionPct: input.completionPct,
    workItems: {
      create: input.workItems.map((workItem) => ({
        contractor: workItem.contractor.trim(),
        workDescription: workItem.workDescription.trim(),
        engineerName: workItem.engineerName.trim(),
        location: workItem.location.trim()
      }))
    }
  };
}

export function toReportUpdateData(input: UpdateReportInput) {
  const data: {
    projectId?: string;
    date?: Date;
    summary?: string | null;
    workersOnSite?: number;
    plannedProgressPct?: number;
    actualProgressPct?: number;
    completionPct?: number;
    workItems?: {
      deleteMany: Record<string, never>;
      create: Array<{
        contractor: string;
        workDescription: string;
        engineerName: string;
        location: string;
      }>;
    };
  } = {};

  if (input.projectId !== undefined) {
    data.projectId = input.projectId;
  }

  if (input.date !== undefined) {
    data.date = new Date(`${input.date}T00:00:00.000Z`);
  }

  if (input.summary !== undefined) {
    data.summary = input.summary?.trim() ? input.summary.trim() : null;
  }

  if (input.workersOnSite !== undefined) {
    data.workersOnSite = input.workersOnSite;
  }

  if (input.plannedProgressPct !== undefined) {
    data.plannedProgressPct = input.plannedProgressPct;
  }

  if (input.actualProgressPct !== undefined) {
    data.actualProgressPct = input.actualProgressPct;
  }

  if (input.completionPct !== undefined) {
    data.completionPct = input.completionPct;
  }

  if (input.workItems !== undefined) {
    data.workItems = {
      deleteMany: {},
      create: input.workItems.map((workItem) => ({
        contractor: workItem.contractor.trim(),
        workDescription: workItem.workDescription.trim(),
        engineerName: workItem.engineerName.trim(),
        location: workItem.location.trim()
      }))
    };
  }

  return data;
}

export function getReportHeadline(report: Pick<Report, "summary" | "workItems">) {
  if (report.summary?.trim()) {
    return report.summary.trim();
  }

  if (report.workItems.length === 1) {
    return report.workItems[0].workDescription;
  }

  return `${report.workItems.length} work items logged`;
}

export function getReportSubline(
  report: Pick<Report, "workersOnSite" | "contractorsOnSiteCount">
) {
  return `${report.workersOnSite} workers on site - ${report.contractorsOnSiteCount} contractors on site`;
}

function countDistinctContractors(workItems: ReportWorkItem[]) {
  return new Set(
    workItems
      .map((workItem) => workItem.contractor.trim().toLowerCase())
      .filter(Boolean)
  ).size;
}
