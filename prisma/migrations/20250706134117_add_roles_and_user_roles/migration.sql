-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- Add contractor status column and drop isDraft
ALTER TABLE "Contractor" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT';

UPDATE "Contractor" SET "status" = CASE "isDraft" WHEN 0 THEN 'APPROVED' ELSE 'DRAFT' END;

-- Drop isDraft column
ALTER TABLE "Contractor" DROP COLUMN "isDraft";

-- Seed roles
INSERT INTO "Role" ("name", "description", "createdAt", "updatedAt") VALUES
('admin', 'Administrator with full system access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('contractor', 'Contractor with limited access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
