import { describe, it, expect, beforeAll } from "vitest";
import { startCrawl, getCrawl, getCrawlErrors, listActiveCrawls } from "./firecrawl.server";

describe("firecrawl client", () => {
  beforeAll(() => {
    process.env.FIRECRAWL_API_KEY = "test_key";
  });

  it("starts a crawl and returns id", async () => {
    const fakeFetch = async () => ({
      ok: true,
      json: async () => ({ success: true, id: "crawl_123", url: "https://example.com" }),
    }) as any;
    const id = await startCrawl("https://example.com", { limit: 5 }, fakeFetch);
    expect(id).toBe("crawl_123");
  });

  it("throws on non-ok startCrawl", async () => {
    const fakeFetch = async () => ({ ok: false, status: 402, text: async () => "Payment required" }) as any;
    await expect(startCrawl("https://example.com", {}, fakeFetch)).rejects.toThrow(/402/);
  });

  it("gets crawl status", async () => {
    const fakeFetch = async () => ({
      ok: true,
      json: async () => ({ id: "crawl_1", status: "completed", items: [{ url: "https://example.com", markdown: "Hello" }] }),
    }) as any;
    const res = await getCrawl("crawl_1", fakeFetch);
    expect(res.status).toBe("completed");
    expect(res.items?.length).toBe(1);
  });

  it("gets crawl errors", async () => {
    const fakeFetch = async () => ({
      ok: true,
      json: async () => ({ errors: [{ url: "https://example.com/404", status: 404 }] }),
    }) as any;
    const res: any = await getCrawlErrors("crawl_1", fakeFetch);
    expect(res.errors?.length).toBe(1);
  });

  it("lists active crawls", async () => {
    const fakeFetch = async () => ({ ok: true, json: async () => ({ active: [] }) }) as any;
    const res: any = await listActiveCrawls(fakeFetch);
    expect(res.active).toBeDefined();
  });
});


