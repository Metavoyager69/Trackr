import { z } from "zod";

export const projectInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required.")
    .max(120, "Project name must be 120 characters or less."),
  goalSummary: z
    .string()
    .trim()
    .min(1, "Goal summary is required.")
    .max(2000, "Goal summary must be 2000 characters or less.")
});

export const projectPatchSchema = projectInputSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one project field to update."
  );

export const reportWorkItemInputSchema = z.object({
  contractor: z
    .string()
    .trim()
    .min(1, "Contractor is required.")
    .max(120, "Contractor must be 120 characters or less."),
  workDescription: z
    .string()
    .trim()
    .min(1, "Work description is required.")
    .max(2000, "Work description must be 2000 characters or less."),
  engineerName: z
    .string()
    .trim()
    .min(1, "Engineer name is required.")
    .max(120, "Engineer name must be 120 characters or less."),
  location: z
    .string()
    .trim()
    .min(1, "Location is required.")
    .max(240, "Location must be 240 characters or less.")
});

export const reportInputSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required."),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
  summary: z
    .string()
    .trim()
    .max(2000, "Summary must be 2000 characters or less.")
    .optional()
    .transform((value) => value?.trim() ?? ""),
  workersOnSite: z
    .number({ error: "Workers on site must be a whole number." })
    .int("Workers on site must be a whole number.")
    .min(0, "Workers on site cannot be negative.")
    .max(100000, "Workers on site is too large."),
  plannedProgressPct: z
    .number({ error: "Planned progress must be a whole number." })
    .int("Planned progress must be a whole number.")
    .min(0, "Planned progress must be between 0 and 100.")
    .max(100, "Planned progress must be between 0 and 100."),
  actualProgressPct: z
    .number({ error: "Actual progress must be a whole number." })
    .int("Actual progress must be a whole number.")
    .min(0, "Actual progress must be between 0 and 100.")
    .max(100, "Actual progress must be between 0 and 100."),
  completionPct: z
    .number({ error: "Completion must be a whole number." })
    .int("Completion must be a whole number.")
    .min(0, "Completion must be between 0 and 100.")
    .max(100, "Completion must be between 0 and 100."),
  workItems: z
    .array(reportWorkItemInputSchema)
    .min(1, "Add at least one work item to the daily report.")
});

export const reportPatchSchema = z
  .object({
    projectId: z.string().trim().min(1, "Project is required.").optional(),
    date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
      .optional(),
    summary: z
      .union([
        z
          .string()
          .trim()
          .max(2000, "Summary must be 2000 characters or less."),
        z.null()
      ])
      .optional(),
    workersOnSite: z
      .number({ error: "Workers on site must be a whole number." })
      .int("Workers on site must be a whole number.")
      .min(0, "Workers on site cannot be negative.")
      .max(100000, "Workers on site is too large.")
      .optional(),
    plannedProgressPct: z
      .number({ error: "Planned progress must be a whole number." })
      .int("Planned progress must be a whole number.")
      .min(0, "Planned progress must be between 0 and 100.")
      .max(100, "Planned progress must be between 0 and 100.")
      .optional(),
    actualProgressPct: z
      .number({ error: "Actual progress must be a whole number." })
      .int("Actual progress must be a whole number.")
      .min(0, "Actual progress must be between 0 and 100.")
      .max(100, "Actual progress must be between 0 and 100.")
      .optional(),
    completionPct: z
      .number({ error: "Completion must be a whole number." })
      .int("Completion must be a whole number.")
      .min(0, "Completion must be between 0 and 100.")
      .max(100, "Completion must be between 0 and 100.")
      .optional(),
    workItems: z
      .array(reportWorkItemInputSchema)
      .min(1, "Add at least one work item to the daily report.")
      .optional()
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one report field to update."
  );

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ReportInput = z.infer<typeof reportInputSchema>;
export type ProjectPatchInput = z.infer<typeof projectPatchSchema>;
export type ReportPatchInput = z.infer<typeof reportPatchSchema>;
