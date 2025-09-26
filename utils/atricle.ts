import { db } from "@/db";
import { xinhongNotes } from "@/db/schema";
import { extractJsonFromText } from "@/lib/llm-utils";
import { is_explicit_title } from "@/prompts/generate-article";
import { deepseek } from "@/utils/llm";
import { streamText } from "ai";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface SearchQuery {
  search_query: string;
  reason: string;
  topic: string[];
}

export async function getSearchQuery() {
  const notes = await db
    .select()
    .from(xinhongNotes)
    // 根据时间和评论数排序
    .orderBy(desc(xinhongNotes.createTimestamp), desc(xinhongNotes.comment))
    .where(eq(xinhongNotes.used, false));

  const note = notes[0];

  // 生成搜索关键词
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
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate search query" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
