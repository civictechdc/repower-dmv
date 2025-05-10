/*
  Warnings:

  - Made the column `isDraft` on table `Contractor` required. This step will fail if there are existing NULL values in that column.

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
    "isDraft" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Contractor" ("addressLine1", "addressLine2", "city", "createdAt", "email", "id", "isDraft", "name", "phone", "state", "updatedAt", "website", "zip") SELECT "addressLine1", "addressLine2", "city", "createdAt", "email", "id", "isDraft", "name", "phone", "state", "updatedAt", "website", "zip" FROM "Contractor";
DROP TABLE "Contractor";
ALTER TABLE "new_Contractor" RENAME TO "Contractor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
