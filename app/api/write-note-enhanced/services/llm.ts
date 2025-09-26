/**
 * LLM服务模块
 */

import { extractJsonFromText } from "@/lib/llm-utils";
import {
  generate_article,
  generate_selling_point,
  is_explicit_title,
} from "@/prompts/generate-article";
import { deepseek } from "@/utils/llm";
import { streamText } from "ai";
import { Article, Note, SearchQuery, SellingPoint } from "../types";
import { retryWithLogging } from "../utils/retry";

/**
 * 生成搜索关键词
 * @param note 笔记数据
 * @returns Promise<SearchQuery>
 */
export async function generateSearchQuery(note: Note): Promise<SearchQuery> {
  return retryWithLogging(async () => {
    const prompt = is_explicit_title(note.title, note.content);

    const result = streamText({
      model: deepseek("deepseek-ai/DeepSeek-V3"),
      prompt: prompt,
    });

    let searchQueryText = "";
    for await (const textPart of result.textStream) {
      searchQueryText += textPart;
    }

    const searchQueryJson = extractJsonFromText<SearchQuery>(searchQueryText);
    if (!searchQueryJson) {
      throw new Error("Failed to parse search query JSON");
    }

    return searchQueryJson;
  }, "生成搜索关键词");
}

/**
 * 生成文章
 * @param searchContent 搜索内容
 * @returns Promise<Article>
 */
export async function generateArticle(searchContent: string): Promise<Article> {
  return retryWithLogging(async () => {
    const articlePrompt = generate_article(searchContent);

    const articleResult = streamText({
      model: deepseek("deepseek-ai/DeepSeek-V3"),
      prompt: articlePrompt,
    });

    let articleText = "";
    for await (const textPart of articleResult.textStream) {
      articleText += textPart;
    }

    const articleJson = extractJsonFromText<Article>(articleText);
    if (!articleJson) {
      throw new Error("Failed to parse article JSON");
    }

    return articleJson;
  }, "生成文章");
}

/**
 * 生成卖点
 * @param articleContent 文章内容
 * @returns Promise<SellingPoint>
 */
export async function generateSellingPoint(
  articleContent: string
): Promise<SellingPoint> {
  return retryWithLogging(async () => {
    const sellingPointPrompt = generate_selling_point(articleContent);

    const sellingPointResult = streamText({
      model: deepseek("deepseek-ai/DeepSeek-V3"),
      prompt: sellingPointPrompt,
    });

    let sellingPointText = "";
    for await (const textPart of sellingPointResult.textStream) {
      sellingPointText += textPart;
    }

    const sellingPointJson =
      extractJsonFromText<SellingPoint>(sellingPointText);
    if (!sellingPointJson || !sellingPointJson.selling_point_paragraph) {
      throw new Error("Failed to parse selling point JSON or missing content");
    }

    return sellingPointJson;
  }, "生成卖点");
}
