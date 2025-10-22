import { GoogleGenerativeAI } from "@google/generative-ai";
import invariant from "tiny-invariant";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  invariant(apiKey, "GEMINI_API_KEY is required");
  return new GoogleGenerativeAI(apiKey);
}

export type CrawlAnalysis = {
  summary: string;
  services: string[];
  coverageAreas: string[];
  emails: string[];
  phones: string[];
  urls: string[];
};

export async function analyzeCrawlMarkdown(
  pages: Array<{ url: string; markdown?: string }>,
): Promise<CrawlAnalysis> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const merged = pages
    .map((p) => `# URL: ${p.url}\n${(p.markdown || "").slice(0, 20000)}`)
    .join("\n\n---\n\n");

  const prompt = `
You are analyzing a home performance contractor website crawl. Extract concise structured data as strict JSON:
{
  "summary": string,
  "services": string[],
  "coverageAreas": string[],
  "emails": string[],
  "phones": string[],
  "urls": string[]
}

Rules:
- Keep services as human-readable names found on site.
- coverageAreas should be US state names/abbreviations or city/region names.
- Collect any contact emails/phones that appear legitimate.
- urls: include the main contact page and services pages if present.
Return ONLY JSON, no extra text.

Content:
${merged}
`.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text() || "{}";
  try {
    const parsed = JSON.parse(text);
    return {
      summary: String(parsed.summary || ""),
      services: Array.isArray(parsed.services) ? parsed.services.map(String) : [],
      coverageAreas: Array.isArray(parsed.coverageAreas) ? parsed.coverageAreas.map(String) : [],
      emails: Array.isArray(parsed.emails) ? parsed.emails.map(String) : [],
      phones: Array.isArray(parsed.phones) ? parsed.phones.map(String) : [],
      urls: Array.isArray(parsed.urls) ? parsed.urls.map(String) : [],
    };
  } catch {
    return { summary: "", services: [], coverageAreas: [], emails: [], phones: [], urls: [] };
  }
}


