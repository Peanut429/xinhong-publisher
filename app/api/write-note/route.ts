import { db } from "@/db";
import { xinhongNotes } from "@/db/schema";
import { botTasks } from "@/db/schema/bot-task";
import { extractJsonFromText } from "@/lib/llm-utils";
import {
  generate_article,
  generate_selling_point,
  is_explicit_title,
} from "@/prompts/generate-article";
import { rewriteText } from "@/service/generate-image";
import { webSearch } from "@/service/web-search";
import { deepseek } from "@/utils/llm";
import { streamText } from "ai";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface SearchQuery {
  search_query: string;
  reason: string;
  topic: string[];
}

interface Article {
  title: string;
  content: string;
  topic: string[];
}

interface SellingPoint {
  selling_point_paragraph: string;
  topic: string[];
}

export async function POST(request: NextRequest) {
  const requestBody = await request.json();

  const accountId = requestBody.accountId;
  const phoneNumber = requestBody.phoneNumber;

  const notes = await db
    .select()
    .from(xinhongNotes)
    .orderBy(desc(xinhongNotes.createTimestamp))
    .where(eq(xinhongNotes.used, false));

  // 选参考
  // const randomIndex = Math.floor(Math.random() * notes.length);
  // const note = notes[randomIndex];
  const note = notes[0];

  // 生成搜索关键词
  const prompt = is_explicit_title(note.title, note.content);

  console.log(prompt);

  const result = streamText({
    model: deepseek("deepseek-ai/DeepSeek-V3"),
    prompt: prompt,
  });

  let searchQueryText = "";
  for await (const textPart of result.textStream) {
    console.log(textPart);
    searchQueryText += textPart;
  }

  const searchQueryJson = extractJsonFromText<SearchQuery>(searchQueryText);
  if (!searchQueryJson) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate search query" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 联网搜索信息
  const searchResult = await webSearch(searchQueryJson.search_query);

  if (
    searchResult.code !== 200 ||
    searchResult.data.webPages.value.length < 1
  ) {
    // 将数据改为已使用
    await db
      .update(xinhongNotes)
      .set({ used: true })
      .where(eq(xinhongNotes.id, note.id));
    return NextResponse.json(
      { error: "Search information failed" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const searchContent = searchResult.data.webPages.value
    .map((item: any) => `标题:${item.name}\n描述:${item.snippet}`)
    .join("\n\n");

  // 生成笔记内容
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
    return NextResponse.json(
      { error: "Failed to generate article" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 根据笔记内容写一段与荣威卖点相近的段落
  const sellingPointPrompt = generate_selling_point(articleJson.content);

  const sellingPointResult = streamText({
    model: deepseek("deepseek-ai/DeepSeek-V3"),
    prompt: sellingPointPrompt,
  });

  let sellingPointText = "";
  for await (const textPart of sellingPointResult.textStream) {
    sellingPointText += textPart;
  }

  const sellingPointJson = extractJsonFromText<SellingPoint>(sellingPointText);

  if (!sellingPointJson || !sellingPointJson.selling_point_paragraph) {
    return NextResponse.json(
      { error: "Failed to generate selling point" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 生成图片
  const regexp =
    /[^\u4e00-\u9fa5a-zA-Z0-9\s\.,!?;:()\-\[\]{}'"/@#$%^&*+=<>|\\~`_]/g;
  const image = await rewriteText(
    articleJson.title.replace(regexp, "").replace(/"/g, '"').trim()
  );

  const content =
    articleJson.content.replace(/#.*\s?/g, "") +
    "\n\n\n" +
    sellingPointJson.selling_point_paragraph.replace(/#.*\s?/g, "");

  // 保存笔记
  const botTask = await db
    .insert(botTasks)
    .values({
      id: crypto.randomUUID(),
      accountId,
      platform: "xhs",
      phoneNumber: phoneNumber,
      reportId: "",
      title: articleJson.title,
      images: ["https://qianyi-aigc.tos-cn-shanghai.volces.com/" + image],
      content: content,
      topic: [...articleJson.topic, ...sellingPointJson.topic].slice(0, 10),
      createTimestamp: Date.now(),
      updateTimestamp: Date.now(),
    })
    .returning();

  await db
    .update(xinhongNotes)
    .set({ used: true })
    .where(eq(xinhongNotes.id, note.id));

  console.group("generate result");
  console.log({
    searchResult,
    note,
    articleJson,
    sellingPointJson,
    image,
    taskId: botTask[0].id,
  });
  console.groupEnd();

  return NextResponse.json({
    searchResult,
    note,
    articleJson,
    sellingPointJson,
    image,
  });
}
