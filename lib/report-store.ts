import type { Report } from "./report-types";

const STORAGE_KEY = "construction-daily-reports";
const REPORTS_UPDATED_EVENT = "reports-updated";

const seedReports: Report[] = [
  {
    id: "central-plaza-2026-04-18",
    date: "2026-04-18",
    siteName: "Central Plaza Tower",
    summary:
      "Completed steel fixing for the second-floor slab and poured concrete for the east stairwell."
  },
  {
    id: "harbor-view-2026-04-17",
    date: "2026-04-17",
    siteName: "Harbor View Apartments",
    summary:
      "Installed drainage lines on the ground floor and inspected the south retaining wall."
  }
];

export function getAllReports() {
  const localReports = getStoredReports();
  const reportMap = new Map<string, Report>();

  [...seedReports, ...localReports].forEach((report) => {
    reportMap.set(report.id, report);
  });

  return Array.from(reportMap.values()).sort((first, second) =>
    second.date.localeCompare(first.date)
  );
}

export function getSeedReports() {
  return [...seedReports];
}

export function getReportById(id: string) {
  return getAllReports().find((report) => report.id === id) ?? null;
}

export function getSeedReportById(id: string) {
  return seedReports.find((report) => report.id === id) ?? null;
}

export function saveReport(report: Report) {
  if (typeof window === "undefined") {
    return;
  }

  const reports = getStoredReports();
  const updatedReports = [report, ...reports.filter((item) => item.id !== report.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
  window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT));
}

export function subscribeToReports(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(REPORTS_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(REPORTS_UPDATED_EVENT, callback);
  };
}

function getStoredReports() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const reports = window.localStorage.getItem(STORAGE_KEY);

    if (!reports) {
      return [];
    }

    const parsedReports = JSON.parse(reports);

    if (!Array.isArray(parsedReports)) {
      return [];
    }

    return parsedReports
      .map((report) => normalizeStoredReport(report))
      .filter((report): report is Report => report !== null);
  } catch {
    return [];
  }
}

function normalizeStoredReport(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const id = getString(value.id);
  const date = getString(value.date);
  const siteName = getString(value.siteName) ?? getString(value.projectName);
  const summary = getString(value.summary) ?? getString(value.workCompleted);

  if (!id || !date || !siteName || !summary) {
    return null;
  }

  return {
    id,
    date,
    siteName,
    summary
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : null;
}
