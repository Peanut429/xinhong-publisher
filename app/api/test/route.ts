import { mastra } from "@/mastra";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await mastra
    .getAgent("toutiaoArticleAgent")
    .generate("告诉我懂车帝上阅读数最高的前三条新闻标题");

  return NextResponse.json({ result: result.text });
}
