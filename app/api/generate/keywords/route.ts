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
  topic: string[];
}

export async function POST(request: NextRequest) {
  try {
    const notes = await db
      .select()
      .from(xinhongNotes)
      .where(eq(xinhongNotes.used, false));

    if (!notes || notes.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "No available notes to generate keywords" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

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
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call internal API route with absolute URL to avoid Node relative URL errors
    const origin = new URL(request.url).origin;
    let searchContent: unknown = null;
    try {
      const webSearchResp = await fetch(
        `${origin}/api/generate/search-for-information`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords: searchQueryJson.search_query }),
        }
      );
      if (webSearchResp.ok) {
        const webSearchJson = await webSearchResp.json().catch(() => null);
        if (webSearchJson) {
          searchContent = webSearchJson.data.data.webPages.value.map(
            (item: any) => {
              return {
                name: item.name,
                snippet: item.snippet,
              };
            }
          );
        }
      }
    } catch (_) {}

    return new NextResponse(
      JSON.stringify({
        search_query: searchQueryJson.search_query,
        reason: searchQueryJson.reason,
        topic: note.tags,
        search_content: searchContent,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error", message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
