import { describe, it, expect, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { setContractorDraftStatus, deleteContractorById } from "~/models/contractor.server";

const prisma = new PrismaClient();

describe("admin contractors model helpers", () => {
  let contractorId: string;

  beforeAll(async () => {
    const c = await prisma.contractor.create({
      data: {
        name: "Test Co",
        addressLine1: "123 A St",
        city: "DC",
        state: "DC",
        zip: "20001",
        isDraft: true,
      },
    });
    contractorId = c.id;
  });

  it("toggles draft status", async () => {
    const updated = await setContractorDraftStatus(contractorId, false);
    expect(updated.isDraft).toBe(false);
    const updatedBack = await setContractorDraftStatus(contractorId, true);
    expect(updatedBack.isDraft).toBe(true);
  });

  it("deletes contractor", async () => {
    await deleteContractorById(contractorId);
    const found = await prisma.contractor.findUnique({ where: { id: contractorId } });
    expect(found).toBeNull();
  });
});

