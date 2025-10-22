import { describe, it, expect, vi } from "vitest";

vi.mock("~/session.server", () => ({ requireAdmin: async () => ({ id: "admin" }) }));
vi.mock("~/models/contractor.server", () => ({
  listAllContractorsForAdmin: async () => ([{ id: "1", name: "A", city: "Washington", state: "DC", website: null, email: null, phone: null, addressLine1: "1", addressLine2: null, isDraft: true }]),
  listStates: async () => [],
  listServices: async () => [],
  listCertifications: async () => [],
  setContractorDraftStatus: async () => ({}),
  deleteContractorById: async () => ({}),
  updateContractorPlaceId: async () => ({}),
  lookupAndSetContractorPlaceId: async () => ({}),
  refreshContractorGoogleData: async () => ({}),
  lookupByNameAndZipAndSetPlaceId: async () => ({}),
  bulkRefreshAllContractorsGoogle: async () => ({ refreshedExisting: 1, lookedUpNew: 2 }),
  previewTopGoogleCandidates: async () => ({ candidates: [], queries: [] }),
  clearContractorPlaceId: async () => ({}),
  updateContractorByAdmin: async () => ({}),
  startContractorWebsiteCrawl: async () => ({}),
  pollContractorCrawl: async () => ({}),
  analyzeContractorCrawl: async () => ({}),
}));

describe("admin contractors route intents", () => {
  it("wires start/poll/analyze crawl without crashing", async () => {
    // This is a smoke test on the action handlers by importing the module
    const mod = await import("./admin.contractors");
    expect(typeof mod.action).toBe("function");
    expect(typeof mod.loader).toBe("function");
  });
});

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


