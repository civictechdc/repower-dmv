import { describe, it, expect, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { startContractorWebsiteCrawl, pollContractorCrawl, analyzeContractorCrawl } from "./contractor.server";

// Mock firecrawl and gemini modules to avoid network calls
vi.mock("~/lib/firecrawl.server", () => ({
  startCrawl: async () => "crawl_test_id",
  getCrawl: async () => ({ status: "completed", items: [{ url: "https://example.com", markdown: "Hello world" }] }),
  getCrawlErrors: async () => ({ errors: [] }),
}));

vi.mock("~/lib/gemini.server", () => ({
  analyzeCrawlMarkdown: async () => ({ summary: "Summary", services: ["HVAC"], coverageAreas: ["DC"], emails: [], phones: [], urls: [] }),
}));

const prisma = new PrismaClient();

describe("contractor crawl workflow", () => {
  let contractorId: string;
  beforeAll(async () => {
    const c = await prisma.contractor.create({
      data: {
        name: "Web Co",
        addressLine1: "1 Main St",
        city: "Washington",
        state: "DC",
        zip: "20001",
        isDraft: true,
        website: "https://example.com",
      },
    });
    contractorId = c.id;
  });

  it("starts a crawl and saves metadata", async () => {
    const res = await startContractorWebsiteCrawl(contractorId);
    expect(res.crawlId).toBe("crawl_test_id");
  });

  it("polls crawl and stores items/errors", async () => {
    const res = await pollContractorCrawl(contractorId);
    expect(res.status).toBe("completed");
    expect(res.items).toBe(1);
  });

  it("analyzes crawl and stores summary", async () => {
    const analysis = await analyzeContractorCrawl(contractorId);
    expect(analysis.summary).toBe("Summary");
  });
});


