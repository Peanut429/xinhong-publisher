import { webSearch } from "@/service/web-search";
import { tool } from "ai";
import { z } from "zod";

export const bochaWebSearch = tool({
  description: `Search with Bocha Web Search and get enhanced search details from billions of web documents,
including page titles, urls, summaries, site names, site icons, publication dates, image links, and more.
Args:
query: Search query (required)
freshness: The time range for the search results. (Available options YYYY-MM-DD, YYYY-MM-DD..YYYY-MM-DD, noLimit, oneYear, oneMonth, oneWeek, oneDay. Default is noLimit)
count: Number of results (1-50, default 10)`,
  inputSchema: z.object({
    keywords: z.string().describe("search keywords"),
  }),
  execute: async ({ keywords }: { keywords: string }) => {
    const result = await webSearch(keywords);
    return result;
  },
});

export const getKeywordsTool = tool({
  description: `Get keywords from the given text`,
  inputSchema: z.object({
    text: z.string().describe("text to get keywords from"),
  }),
  execute: async ({ text }: { text: string }) => {
    return text;
  },
});
