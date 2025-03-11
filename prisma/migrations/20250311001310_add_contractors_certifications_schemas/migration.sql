-- CreateTable
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "websiteURL" TEXT,
    "address" TEXT,
    "numberOfReviews" INTEGER
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contractorId" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    CONSTRAINT "Certification_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contractorId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    CONSTRAINT "Service_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatesServed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contractorId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    CONSTRAINT "StatesServed_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Certification_contractorId_certificationName_key" ON "Certification"("contractorId", "certificationName");

-- CreateIndex
CREATE UNIQUE INDEX "Service_contractorId_serviceName_key" ON "Service"("contractorId", "serviceName");

-- CreateIndex
CREATE UNIQUE INDEX "StatesServed_contractorId_state_key" ON "StatesServed"("contractorId", "state");
