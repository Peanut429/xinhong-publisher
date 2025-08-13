import { db } from "@/db";
import { xinhongNotes } from "@/db/schema";
import { extractJsonFromText } from "@/lib/llm-utils";
import { is_explicit_title } from "@/prompts/generate-article";
import { deepseek } from "@/utils/llm";
import { streamText } from "ai";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface SearchQuery {
  search_query: string;
  reason: string;
}

export async function POST(request: NextRequest) {
  const notes = await db
    .select()
    .from(xinhongNotes)
    .where(eq(xinhongNotes.used, false));

  const randomIndex = Math.floor(Math.random() * notes.length);
  const note = notes[randomIndex];

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
      {
        status: 500,
      }
    );
  }

  // const webSearchResult = await webSearch(searchQueryJson.search_query);

  return new NextResponse(
    JSON.stringify({
      search_query: searchQueryJson.search_query,
      reason: searchQueryJson.reason,
      // web_search_result: webSearchResult,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
