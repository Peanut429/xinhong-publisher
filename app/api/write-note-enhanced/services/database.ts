/**
 * 数据库服务模块
 */

import { db } from "@/db";
import { xinhongNotes } from "@/db/schema";
import { botTasks } from "@/db/schema/bot-task";
import { desc, eq } from "drizzle-orm";
import { BotTask, Note } from "../types";
import { retryWithLogging } from "../utils/retry";

/**
 * 获取可用的笔记
 * @returns Promise<Note>
 */
export async function getAvailableNote(): Promise<Note> {
  return retryWithLogging(async () => {
    const notes = await db
      .select()
      .from(xinhongNotes)
      .orderBy(desc(xinhongNotes.createTimestamp), desc(xinhongNotes.comment))
      .where(eq(xinhongNotes.used, false))
      .limit(1);

    if (!notes || notes.length === 0) {
      throw new Error("No available notes found");
    }

    return notes[0] as Note;
  }, "获取可用笔记");
}

/**
 * 标记笔记为已使用
 * @param noteId 笔记ID
 * @returns Promise<void>
 */
export async function markNoteAsUsed(noteId: string): Promise<void> {
  // 标记笔记为已使用不需要重试，失败了就失败了
  try {
    await db
      .update(xinhongNotes)
      .set({ used: true })
      .where(eq(xinhongNotes.id, noteId));
    console.log(`笔记 ${noteId} 已标记为已使用`);
  } catch (error) {
    console.error(`标记笔记 ${noteId} 为已使用失败:`, error);
    // 不抛出错误，避免中断主流程
  }
}

/**
 * 创建机器人任务
 * @param taskData 任务数据
 * @returns Promise<BotTask>
 */
export async function createBotTask(taskData: {
  accountId: string;
  platform: string;
  phoneNumber: string;
  reportId: string;
  title: string;
  images: string[];
  content: string;
  topic: string[];
}): Promise<BotTask> {
  return retryWithLogging(async () => {
    const result = await db
      .insert(botTasks)
      .values({
        id: crypto.randomUUID(),
        ...taskData,
        createTimestamp: Date.now(),
        updateTimestamp: Date.now(),
      })
      .returning();

    return result[0] as BotTask;
  }, "创建机器人任务");
}
