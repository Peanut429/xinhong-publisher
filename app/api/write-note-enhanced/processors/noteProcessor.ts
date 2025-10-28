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
import { Note, ProcessResult, SearchQuery } from "../types";
import { delay } from "../utils/retry";

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
  let searchQueryJson: SearchQuery;
  try {
    searchQueryJson = await generateSearchQuery(note);
  } catch (err) {
    console.error("生成搜索关键词失败，将标记该笔记为已使用并尝试下一篇", err);
    await markNoteAsUsed(note.id);
    throw new Error("SearchQueryGenerateError: 生成搜索关键词失败");
  }

  // 如果关键词为空，视为该笔记不合适，标记已使用并抛错让上层改选
  if (!searchQueryJson?.search_query || !searchQueryJson.search_query.trim()) {
    console.warn(
      "生成的搜索关键词为空，当前笔记内容不合适，将标记为已使用并切换下一篇"
    );
    await markNoteAsUsed(note.id);
    throw new Error("SearchQueryEmpty: 关键词为空");
  }

  console.log(`搜索关键词: ${searchQueryJson.search_query}`);

  // 联网搜索
  console.log("开始联网搜索...");
  const searchResult = await performWebSearch(searchQueryJson.search_query);
  console.log(`搜索到 ${searchResult.length} 条结果`);

  // 构建搜索内容
  const searchContent = buildSearchContent(searchResult);

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
  const { accountId, phoneNumber } = options;
  const maxNotesToTry = RETRY_CONFIG.MAX_NOTES_TO_TRY;

  let lastError: Error | null = null;
  const processedNoteIds: string[] = [];

  // 不使用外层重试，只在内部处理多篇笔记
  for (let i = 0; i < maxNotesToTry; i++) {
    let currentNote: Note | null = null;

    try {
      console.log(`\n📝 开始处理第 ${i + 1}/${maxNotesToTry} 篇笔记`);

      // 获取笔记
      currentNote = await getAvailableNote();
      console.log(`获取到笔记: "${currentNote.title}"`);
      processedNoteIds.push(currentNote.id);

      // 处理笔记
      const result = await processSingleNote(
        accountId,
        phoneNumber,
        currentNote
      );

      console.log(`✅ 笔记处理成功: ${currentNote.title}`);
      return { success: true, data: result };
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ 处理第 ${i + 1} 篇笔记失败:`, error);

      // 如果是搜索失败或内容生成失败，标记当前笔记为已使用
      // if (currentNote && lastError.message.includes("Search")) {
      //   try {
      //     await markNoteAsUsed(currentNote.id);
      //     console.log(`已标记笔记 ${currentNote.id} 为已使用（搜索失败）`);
      //   } catch (markError) {
      //     console.error(`标记笔记失败:`, markError);
      //   }
      // }

      // 如果还有其他笔记可以尝试，继续处理
      if (i < maxNotesToTry - 1) {
        console.log(`⏳ 等待1秒后尝试处理下一篇笔记...`);
        await delay(1000);
        continue;
      }
    }
  }

  // 所有笔记都尝试过了，返回失败
  const errorMessage = `所有 ${maxNotesToTry} 篇笔记都处理失败。已尝试笔记ID: ${processedNoteIds.join(
    ", "
  )}。最后错误: ${lastError?.message || "未知错误"}`;
  throw new Error(errorMessage);
}
