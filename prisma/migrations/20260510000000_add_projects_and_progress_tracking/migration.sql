-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goalSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- AlterTable
ALTER TABLE "Report"
ADD COLUMN "projectId" TEXT,
ADD COLUMN "plannedProgressPct" INTEGER,
ADD COLUMN "actualProgressPct" INTEGER,
ADD COLUMN "completionPct" INTEGER;

-- Backfill Projects from legacy siteName values
INSERT INTO "Project" ("id", "name", "goalSummary", "createdAt", "updatedAt")
SELECT
    'legacy-' || md5("siteName"),
    "siteName",
    'Imported from legacy report data.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT "siteName"
    FROM "Report"
) AS "LegacySites";

-- Backfill Report.projectId from legacy siteName values
UPDATE "Report"
SET "projectId" = 'legacy-' || md5("siteName")
WHERE "projectId" IS NULL;

-- Make project relation required after backfill
ALTER TABLE "Report"
ALTER COLUMN "projectId" SET NOT NULL;

-- Add foreign key
ALTER TABLE "Report"
ADD CONSTRAINT "Report_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add progress safety constraints
ALTER TABLE "Report"
ADD CONSTRAINT "Report_plannedProgressPct_range"
CHECK ("plannedProgressPct" IS NULL OR ("plannedProgressPct" BETWEEN 0 AND 100));

ALTER TABLE "Report"
ADD CONSTRAINT "Report_actualProgressPct_range"
CHECK ("actualProgressPct" IS NULL OR ("actualProgressPct" BETWEEN 0 AND 100));

ALTER TABLE "Report"
ADD CONSTRAINT "Report_completionPct_range"
CHECK ("completionPct" IS NULL OR ("completionPct" BETWEEN 0 AND 100));

-- CreateIndex
CREATE INDEX "Report_projectId_date_idx" ON "Report"("projectId", "date");

-- Drop legacy column after backfill
ALTER TABLE "Report"
DROP COLUMN "siteName";
