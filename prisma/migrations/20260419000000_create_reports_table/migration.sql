-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "siteName" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_date_idx" ON "Report"("date");
