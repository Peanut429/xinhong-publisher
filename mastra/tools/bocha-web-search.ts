import { webSearch } from "@/service/web-search";
import { createTool } from "@mastra/core/tools";
import z from "zod";

interface ContentItem {
  unique_id: number;
  unique_id_str: string;
  title: string;
  publish_time: number;
  watch_or_read_count: number;
  has_video: boolean;
  article_type: number;
}

interface DongchediResponse {
  data: {
    news: ContentItem[];
    total: number;
  };
  status: number;
  message: string;
}

export const bochaWebSearch = createTool({
  id: "bocha-web-search",
  description: `Search with Bocha Web Search and get enhanced search details from billions of web documents,
including page titles, urls, summaries, site names, site icons, publication dates, image links, and more.
Args:
query: Search query (required)
freshness: The time range for the search results. (Available options YYYY-MM-DD, YYYY-MM-DD..YYYY-MM-DD, noLimit, oneYear, oneMonth, oneWeek, oneDay. Default is noLimit)
count: Number of results (1-50, default 10)`,
  inputSchema: z.object({
    keywords: z.string().describe("search keywords"),
  }),
  outputSchema: z.object({
    content: z
      .array(
        z.object({
          name: z.string().describe("页面标题"),
          url: z.string().describe("页面URL"),
          snippet: z.string().describe("页面摘要"),
          siteName: z.string().describe("站点名称"),
          siteIcon: z.string().describe("站点图标"),
          datePublished: z.string().describe("发布时间"),
        })
      )
      .describe("搜索结果内容"),
  }),
  execute: async ({ context }) => {
    const keywords = context.keywords;
    const result = await webSearch(keywords);

    console.log("搜索结果数量: ", result.length);
    return { content: result };
  },
});
