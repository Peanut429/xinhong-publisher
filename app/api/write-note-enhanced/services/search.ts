/**
 * 搜索服务模块（统一复用 service 层）
 */

import { webSearch } from "@/service/web-search";
import { WebPageItem, WebSearchResponse } from "../types";
import { retryWithLogging } from "../utils/retry";

/**
 * 执行网络搜索
 * @param searchQuery 搜索关键词
 * @returns Promise<WebSearchResponse>
 */
export async function performWebSearch(
  searchQuery: string
): Promise<WebSearchResponse["data"]["webPages"]["value"]> {
  return retryWithLogging(
    async () => {
      const data = await webSearch(searchQuery);

      if (data.length < 1) {
        throw new Error(
          `Search failed or returned empty results for query: "${searchQuery}"`
        );
      }

      return data as WebSearchResponse["data"]["webPages"]["value"];
    },
    "执行网络搜索",
    2
  );
}

/**
 * 构建搜索内容字符串
 * @param webPages 网页搜索结果
 * @returns string
 */
export function buildSearchContent(webPages: WebPageItem[]): string {
  return webPages
    .map((item) => `标题:${item.name}\n描述:${item.snippet}`)
    .join("\n\n");
}
