export type Report = {
  id: string;
  projectName: string;
  date: string;
  weather: string;
  crewSize: number;
  workCompleted: string;
  notes: string;
};

const STORAGE_KEY = "construction-daily-reports";
const REPORTS_UPDATED_EVENT = "reports-updated";

const seedReports: Report[] = [
  {
    id: "central-plaza-2026-04-18",
    projectName: "Central Plaza Tower",
    date: "2026-04-18",
    weather: "Partly cloudy",
    crewSize: 18,
    workCompleted:
      "Completed steel fixing for the second-floor slab and poured concrete for the east stairwell.",
    notes: "Concrete curing barriers were added before close of day."
  },
  {
    id: "harbor-view-2026-04-17",
    projectName: "Harbor View Apartments",
    date: "2026-04-17",
    weather: "Light rain",
    crewSize: 11,
    workCompleted:
      "Installed drainage lines on the ground floor and inspected the south retaining wall.",
    notes: "Rain slowed exterior work for about 90 minutes."
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

export function formatReportDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
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

    return JSON.parse(reports) as Report[];
  } catch {
    return [];
  }
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
