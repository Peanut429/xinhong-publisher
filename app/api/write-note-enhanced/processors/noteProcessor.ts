/**
 * 笔记处理主处理器
 */

import { RETRY_CONFIG } from "../config";
import {
  createBotTask,
  getAvailableNote,
  markNoteAsUsed,
} from "../services/database";
import { generateImage } from "../services/image";
import {
  generateArticle,
  generateSearchQuery,
  generateSellingPoint,
} from "../services/llm";
import { buildSearchContent, performWebSearch } from "../services/search";
import { Note, ProcessResult } from "../types";
import { delay, retryWithLogging } from "../utils/retry";

interface ProcessNoteOptions {
  accountId: string;
  phoneNumber: string;
  noteIndex?: number;
}

/**
 * 处理单篇笔记
 * @param accountId 用户账号ID
 * @param phoneNumber 手机号
 * @param note 笔记数据
 * @returns Promise<ProcessResult>
 */
export async function processSingleNote(
  accountId: string,
  phoneNumber: string,
  note: Note
): Promise<ProcessResult["data"]> {
  console.log(`开始处理笔记: ${note.title}`);

  // 生成搜索关键词
  console.log("开始生成搜索关键词...");
  const searchQueryJson = await generateSearchQuery(note);
  console.log(`搜索关键词: ${searchQueryJson.search_query}`);

  // 联网搜索
  console.log("开始联网搜索...");
  const searchResult = await performWebSearch(searchQueryJson.search_query);
  console.log(`搜索到 ${searchResult.data.webPages.value.length} 条结果`);

  // 构建搜索内容
  const searchContent = buildSearchContent(searchResult.data.webPages.value);

  // 生成文章
  console.log("开始生成文章...");
  const articleJson = await generateArticle(searchContent);
  console.log(`文章标题: ${articleJson.title}`);

  // 生成卖点
  console.log("开始生成卖点...");
  const sellingPointJson = await generateSellingPoint(articleJson.content);
  console.log("卖点生成成功");

  // 生成图片
  console.log("开始生成图片...");
  const image = await generateImage(articleJson.title);
  console.log("图片生成成功");

  // 构建最终内容
  const content =
    articleJson.content.replace(/#.*\s?/g, "") +
    "\n\n\n" +
    sellingPointJson.selling_point_paragraph.replace(/#.*\s?/g, "");

  // 保存到数据库
  console.log("开始保存结果...");
  const botTask = await createBotTask({
    accountId,
    platform: "xhs",
    phoneNumber: phoneNumber,
    reportId: "",
    title: articleJson.title,
    images: [`https://qianyi-aigc.tos-cn-shanghai.volces.com/${image}`],
    content: content,
    topic: [...articleJson.topic, ...sellingPointJson.topic].slice(0, 10),
  });

  // 标记原笔记为已使用
  await markNoteAsUsed(note.id);

  console.log(`处理成功，任务ID: ${botTask.id}`);

  return {
    searchResult,
    note,
    articleJson,
    sellingPointJson,
    image,
    taskId: botTask.id,
  };
}

/**
 * 带备选机制的笔记处理
 * @param options 处理选项
 * @returns Promise<ProcessResult>
 */
export async function processNoteWithFallback(
  options: ProcessNoteOptions
): Promise<ProcessResult> {
  const { accountId, phoneNumber, noteIndex = 0 } = options;
  const maxNotesToTry = RETRY_CONFIG.MAX_NOTES_TO_TRY;

  return retryWithLogging(
    async () => {
      for (let i = 0; i < maxNotesToTry; i++) {
        try {
          console.log(`开始处理第 ${i + 1}/${maxNotesToTry} 篇笔记`);

          // 获取笔记
          const note = await getAvailableNote();
          console.log(`获取到笔记: ${note.title}`);

          // 处理笔记
          const result = await processSingleNote(accountId, phoneNumber, note);

          return { success: true, data: result };
        } catch (error) {
          console.error(`处理第 ${i + 1} 篇笔记失败:`, error);

          // 如果还有其他笔记可以尝试，继续处理
          if (i < maxNotesToTry - 1) {
            console.log(`尝试处理下一篇笔记...`);
            await delay(1000);
            continue;
          }

          // 所有笔记都尝试过了，返回失败
          throw new Error(
            `所有 ${maxNotesToTry} 篇笔记都处理失败: ${
              (error as Error).message
            }`
          );
        }
      }

      throw new Error("Unexpected error in note processing loop");
    },
    `处理笔记 (最多尝试 ${maxNotesToTry} 篇)`,
    1,
    0
  );
}
