/*
  Warnings:

  - A unique constraint covering the columns `[crawlId]` on the table `Contractor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Contractor" ADD COLUMN "crawlCompletedAt" DATETIME;
ALTER TABLE "Contractor" ADD COLUMN "crawlErrors" JSONB;
ALTER TABLE "Contractor" ADD COLUMN "crawlExtract" JSONB;
ALTER TABLE "Contractor" ADD COLUMN "crawlId" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "crawlLastCheckedAt" DATETIME;
ALTER TABLE "Contractor" ADD COLUMN "crawlPages" JSONB;
ALTER TABLE "Contractor" ADD COLUMN "crawlStartedAt" DATETIME;
ALTER TABLE "Contractor" ADD COLUMN "crawlStatus" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "crawlSummary" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_crawlId_key" ON "Contractor"("crawlId");
