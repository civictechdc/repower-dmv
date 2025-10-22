import { describe, it, expect, beforeAll, vi } from "vitest";
import * as Gemini from "./gemini.server";

// We'll stub the GoogleGenerativeAI client by monkey-patching the module's getClient via env and prototype

describe("gemini analysis", () => {
  beforeAll(() => {
    process.env.GEMINI_API_KEY = "test_key";
  });

  it("returns parsed JSON when model returns valid JSON", async () => {
    // Mock the SDK usage path by replacing the model's generateContent
    const original = (Gemini as any).analyzeCrawlMarkdown;

    // Create a tiny shim by temporarily monkey patching GoogleGenerativeAI prototype used inside the module
    const gen = await (async () => {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const proto: any = GoogleGenerativeAI.prototype as any;
      const getGenerativeModelOrig = proto.getGenerativeModel;
      proto.getGenerativeModel = function () {
        return {
          generateContent: async () => ({ response: { text: () => JSON.stringify({ summary: "s", services: ["A"], coverageAreas: ["MD"], emails: ["a@b.com"], phones: ["123"], urls: ["/contact"] }) } }),
        } as any;
      };
      return { proto, getGenerativeModelOrig };
    })();

    const res = await Gemini.analyzeCrawlMarkdown([{ url: "https://x", markdown: "hello" }]);
    expect(res.summary).toBe("s");
    expect(res.services[0]).toBe("A");

    // Restore SDK method
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    (GoogleGenerativeAI.prototype as any).getGenerativeModel = gen.getGenerativeModelOrig;
  });

  it("returns empty defaults when non-JSON", async () => {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const proto: any = GoogleGenerativeAI.prototype as any;
    const orig = proto.getGenerativeModel;
    proto.getGenerativeModel = function () {
      return { generateContent: async () => ({ response: { text: () => "not json" } }) } as any;
    };
    const res = await Gemini.analyzeCrawlMarkdown([{ url: "https://x" }]);
    expect(res.summary).toBe("");
    expect(res.services.length).toBe(0);
    proto.getGenerativeModel = orig;
  });
});


