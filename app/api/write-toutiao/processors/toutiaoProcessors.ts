/**
 * 笔记处理主处理器
 */

import { createBotTask } from "../../write-note-enhanced/services/database";
import { generateSellingPoint } from "../../write-note-enhanced/services/llm";
import { generateToutiaoArticle } from "../services/llm";
import { ToutiaoProcessResult } from "../types";
import { recordUsedDongchediInfo } from "../utils";

/**
 * 处理单篇笔记
 * @param accountId 用户账号ID
 * @param phoneNumber 手机号


 * @returns Promise<ProcessResult>
 */
export async function processSingleToutiaoArticle(
  accountId: string,
  phoneNumber: string
): Promise<ToutiaoProcessResult["data"]> {
  // 生成文章
  console.log("开始生成文章...");
  const articleJson = await generateToutiaoArticle();

  // 生成卖点
  console.log("开始生成卖点...");
  const sellingPointJson = await generateSellingPoint(articleJson.content);
  console.log("卖点生成成功");

  // 构建最终内容
  const content =
    articleJson.content.replace(/#.*\s?/g, "") +
    "\n\n\n" +
    sellingPointJson.selling_point_paragraph.replace(/#.*\s?/g, "");

  // 保存到数据库
  console.log("开始保存结果...");
  const botTask = await createBotTask({
    accountId,
    platform: "toutiao",
    phoneNumber: phoneNumber,
    reportId: "",
    title: "",
    images: [],
    content: content,
    topic: [...articleJson.topic, ...sellingPointJson.topic].slice(0, 10),
  });

  await recordUsedDongchediInfo(articleJson.title);

  console.log(`处理成功，任务ID: ${botTask.id}`);

  return {
    articleJson,
    sellingPointJson,
    taskId: botTask.id,
  };
}
