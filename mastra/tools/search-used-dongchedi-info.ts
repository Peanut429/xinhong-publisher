import { createTool } from "@mastra/core/tools";
import { readFile } from "fs/promises";
import { join } from "path";
import { z } from "zod";

export interface UsedDongchediLog {
  title: string;
  usedAt: number;
}

export const searchUsedDongchediInfo = createTool({
  id: "search-used-dongchedi-info",
  description:
    "查询get-dongchedi-info返回的的title在used-dongchedi-logs.json文件中是否有相同或者类似的标题",
  outputSchema: z.object({
    exists: z.array(z.string()).describe("已使用的标题"),
  }),
  execute: async () => {
    const logPath = join(process.cwd(), "used-dongchedi-logs.json");
    let logs: UsedDongchediLog[] = [];

    try {
      const fileContent = await readFile(logPath, "utf-8");
      if (fileContent.trim()) {
        logs = JSON.parse(fileContent);
        const usedTitles = logs.map((log) => log.title);
        return {
          exists: usedTitles,
        };
      } else {
        return {
          exists: [],
        };
      }
    } catch {
      return {
        exists: [],
      };
    }
  },
});
