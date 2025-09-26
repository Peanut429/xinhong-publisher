/**
 * 搜索服务模块
 */

import { WebPageItem, WebSearchResponse } from "../types";
import { retryWithLogging } from "../utils/retry";

/**
 * 执行网络搜索
 * @param searchQuery 搜索关键词
 * @returns Promise<WebSearchResponse>
 */
export async function performWebSearch(
  searchQuery: string
): Promise<WebSearchResponse> {
  return retryWithLogging(async () => {
    const response = await fetch("https://api.bochaai.com/v1/web-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sk-dff2e9dc60824e2f8c775c4649ad623d",
      },
      body: JSON.stringify({ query: searchQuery, count: 20 }),
    });

    const data = await response.json();

    if (
      data.code !== 200 ||
      !data.data?.webPages?.value ||
      data.data.webPages.value.length < 1
    ) {
      throw new Error("Search returned invalid or empty results");
    }

    return data as WebSearchResponse;
  }, "执行网络搜索");
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
