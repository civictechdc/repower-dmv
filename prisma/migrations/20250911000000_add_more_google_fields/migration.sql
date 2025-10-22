-- Add extended Google Places fields to Contractor
PRAGMA foreign_keys=OFF;
ALTER TABLE "Contractor" ADD COLUMN "googleMapsUri" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "googleBusinessStatus" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "googlePhoneNumber" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "googlePrimaryType" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "googlePrimaryTypeDisplayName" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "googleTypes" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "googleLocation" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "googleEditorialSummary" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "googleGenerativeSummary" TEXT;
ALTER TABLE "Contractor" ADD COLUMN "googleReviewSummary" TEXT;
PRAGMA foreign_keys=ON;
