ALTER TABLE "Project"
ADD COLUMN "projectType" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "plannedDurationDays" INTEGER,
ADD COLUMN "projectPlanFileName" TEXT,
ADD COLUMN "projectPlanMimeType" TEXT,
ADD COLUMN "projectPlanFileData" BYTEA,
ADD COLUMN "projectPlanUploadedAt" TIMESTAMP(3);
