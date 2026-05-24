ALTER TABLE "Report"
ADD COLUMN "workersOnSite" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Report"
ALTER COLUMN "summary" DROP NOT NULL;

CREATE TABLE "ReportWorkItem" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "contractor" TEXT NOT NULL,
    "workDescription" TEXT NOT NULL,
    "engineerName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportWorkItem_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ReportWorkItem" (
    "id",
    "reportId",
    "contractor",
    "workDescription",
    "engineerName",
    "location",
    "createdAt",
    "updatedAt"
)
SELECT
    'legacy-item-' || md5("id"),
    "id",
    'Legacy Entry',
    COALESCE(NULLIF("summary", ''), 'Imported historical report.'),
    'Unknown',
    'Unknown',
    "createdAt",
    "updatedAt"
FROM "Report"
WHERE NOT EXISTS (
    SELECT 1
    FROM "ReportWorkItem" "existing"
    WHERE "existing"."reportId" = "Report"."id"
);

CREATE INDEX "ReportWorkItem_reportId_idx" ON "ReportWorkItem"("reportId");

ALTER TABLE "ReportWorkItem"
ADD CONSTRAINT "ReportWorkItem_reportId_fkey"
FOREIGN KEY ("reportId") REFERENCES "Report"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
