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

export const getDongchediInfo = createTool({
  id: "get-dongchedi-info",
  description: "获取懂车帝网站上的汽车资讯信息",
  inputSchema: z.object({
    page: z.number().describe("获取的页码").default(1),
  }),
  outputSchema: z
    .array(
      z.object({
        title: z.string().describe("资讯标题"),
        watch_or_read_count: z.number("播放或者阅读数"),
      })
    )
    .describe("汽车资讯信息"),
  execute: async () => {
    const response = await fetch(
      `https://www.dongchedi.com/motor/pc/content/get_static?aid=1839&app_name=auto_web_pc&count=48&channel=usage&page=1`
    );
    const data = (await response.json()) as DongchediResponse;

    if (!data.data?.news?.length) {
      throw new Error("No data found");
    }

    return data.data.news.map((item) => ({
      title: item.title,
      watch_or_read_count: item.watch_or_read_count,
    }));
  },
});
