/*
  Warnings:

  - You are about to alter the column `googleEditorialSummary` on the `Contractor` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `googleGenerativeSummary` on the `Contractor` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `googleLocation` on the `Contractor` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `googleReviewSummary` on the `Contractor` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `googleTypes` on the `Contractor` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contractor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "googlePlacesId" TEXT,
    "googleRating" REAL,
    "googleNumRatings" INTEGER,
    "googleReviewsUrl" TEXT,
    "googleMapsUri" TEXT,
    "googleBusinessStatus" TEXT,
    "googlePhoneNumber" TEXT,
    "googlePrimaryType" TEXT,
    "googlePrimaryTypeDisplayName" TEXT,
    "googleTypes" JSONB,
    "googleLocation" JSONB,
    "googleEditorialSummary" JSONB,
    "googleGenerativeSummary" JSONB,
    "googleReviewSummary" JSONB,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Contractor" ("addressLine1", "addressLine2", "city", "createdAt", "email", "googleBusinessStatus", "googleEditorialSummary", "googleGenerativeSummary", "googleLocation", "googleMapsUri", "googleNumRatings", "googlePhoneNumber", "googlePlacesId", "googlePrimaryType", "googlePrimaryTypeDisplayName", "googleRating", "googleReviewSummary", "googleReviewsUrl", "googleTypes", "id", "isDraft", "name", "phone", "state", "updatedAt", "website", "zip") SELECT "addressLine1", "addressLine2", "city", "createdAt", "email", "googleBusinessStatus", "googleEditorialSummary", "googleGenerativeSummary", "googleLocation", "googleMapsUri", "googleNumRatings", "googlePhoneNumber", "googlePlacesId", "googlePrimaryType", "googlePrimaryTypeDisplayName", "googleRating", "googleReviewSummary", "googleReviewsUrl", "googleTypes", "id", "isDraft", "name", "phone", "state", "updatedAt", "website", "zip" FROM "Contractor";
DROP TABLE "Contractor";
ALTER TABLE "new_Contractor" RENAME TO "Contractor";
CREATE UNIQUE INDEX "Contractor_googlePlacesId_key" ON "Contractor"("googlePlacesId");
CREATE INDEX "Contractor_isDraft_name_idx" ON "Contractor"("isDraft", "name");
CREATE INDEX "Contractor_state_city_idx" ON "Contractor"("state", "city");
CREATE INDEX "Contractor_name_idx" ON "Contractor"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
