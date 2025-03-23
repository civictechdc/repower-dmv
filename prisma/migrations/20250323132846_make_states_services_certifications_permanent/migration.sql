/*
  Warnings:

  - You are about to drop the `StatesServed` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `certificationName` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `contractorId` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `contractorId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `serviceName` on the `Service` table. All the data in the column will be lost.
  - Added the required column `description` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortName` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StatesServed_contractorId_state_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StatesServed";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "States" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_ContractorToService" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ContractorToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Contractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContractorToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ContractorToStates" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ContractorToStates_A_fkey" FOREIGN KEY ("A") REFERENCES "Contractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContractorToStates_B_fkey" FOREIGN KEY ("B") REFERENCES "States" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CertificationToContractor" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CertificationToContractor_A_fkey" FOREIGN KEY ("A") REFERENCES "Certification" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CertificationToContractor_B_fkey" FOREIGN KEY ("B") REFERENCES "Contractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
DROP TABLE "Certification";
CREATE TABLE "Certification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Certification_name_key" ON "Certification"("name");
DROP TABLE "Service";
CREATE TABLE "Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "States_name_key" ON "States"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ContractorToService_AB_unique" ON "_ContractorToService"("A", "B");

-- CreateIndex
CREATE INDEX "_ContractorToService_B_index" ON "_ContractorToService"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContractorToStates_AB_unique" ON "_ContractorToStates"("A", "B");

-- CreateIndex
CREATE INDEX "_ContractorToStates_B_index" ON "_ContractorToStates"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CertificationToContractor_AB_unique" ON "_CertificationToContractor"("A", "B");

-- CreateIndex
CREATE INDEX "_CertificationToContractor_B_index" ON "_CertificationToContractor"("B");
