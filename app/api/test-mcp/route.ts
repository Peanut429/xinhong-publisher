import { createWebSearchMcpClient, deepseek } from "@/utils/llm";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const mcpClient = await createWebSearchMcpClient();

  const tools = await mcpClient.tools();

  const response = await generateText({
    model: deepseek("deepseek-ai/DeepSeek-V3"),
    messages: [
      {
        role: "user",
        content: `搜索“${body.search_query}”的相关信息，写一篇小红书的笔记，字数在1000字以内`,
      },
    ],
    tools,
  });

  mcpClient.close();

  return new NextResponse(JSON.stringify(response.content));
}
