import { Firecrawl } from "firecrawl";

export const RUNES_PAGE_URL = "https://maxroll.gg/d2/items/runes";
export const UNIQUES_PAGE_URL = "https://maxroll.gg/d2/database/uniques";

export function createFirecrawlClient() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not set");
  }

  const apiUrl = process.env.FIRECRAWL_API_URL;

  return new Firecrawl({
    apiKey,
    ...(apiUrl ? { apiUrl } : {}),
  });
}

export async function scrapeRunesPageHtml() {
  const client = createFirecrawlClient();
  const document = await client.scrape(RUNES_PAGE_URL, {
    formats: ["html"],
    onlyMainContent: false,
    waitFor: 4000,
    timeout: 120_000,
    maxAge: 0,
    removeBase64Images: true,
  });

  if (!document.html) {
    throw new Error(`Firecrawl returned no HTML for ${RUNES_PAGE_URL}`);
  }

  return document.html;
}
