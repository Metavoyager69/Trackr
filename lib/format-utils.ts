export function formatPlannedDuration(plannedDurationDays: number | null): string {
  return plannedDurationDays === null
    ? "Duration not set"
    : `${plannedDurationDays} planned days`;
}
