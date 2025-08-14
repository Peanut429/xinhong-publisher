import { extractJsonFromText } from "@/lib/llm-utils";
import { google } from "@/utils/llm";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { search_content, topics } = body;

  const prompt = `
  # role: 
   - 你是一个小红书笔记生成器，你的任务是根据给定的笔记标题和笔记内容，生成一篇小红书笔记。
   - 你是小红书的重度用户, 你拥有卓越的互联网网感。你的语气/写作风格非常的小红书化。
   - 考虑到你只在中文互联网的语境下, 你应当使用自然富有网感的中文。你的目标是根据提供的参考内容, 遵循以下步骤进行创作小红书笔记，并且输出为json格式，输出内容一定不可以是Markdown格式 ,json格式为{title: string, content: string, topic: string[]}。
  # 请根据以下参考内容产出小红书爆款文案。要求:
   - 参考内容中包含多个搜索结果，你需要根据这些搜索结果，生成一篇小红书笔记。
   - 单项参考内容的格式为：name: string, snippet: string，其中name为该项参考内容的标题，snippet为该项参考内容的摘要。
   - 尽可能多的使用参考内容中的信息，但是不要完全照搬参考内容
   - 标题：简洁、吸引人，突出核心卖点
     - 标题字数必须限制在15字以内。文本尽量简短。
     - 以口语化的表达方式，激发用户的好奇心。
   - 内容：
     - 突出产品核心卖点
     - 使用生活化、接地气的语言
     - 使用小红书平台常用的表达方式
   - 话题： 根据待处理内容中的原文话题以及正文内容，生成8-10个话题，话题需要符合小红书平台的特点
     - 标签内容为纯文本,不可以有标点符号或者emoji,标签字数要限制在10个字以内,不要使用#开头
     - 核心关键词：核心关键词是一个产品、一篇笔记的核心，一般是产品词或类目词。
     - 关联关键词：顾名思义，关联关键词就是与核心关键词相关的一类词，结构为：核心关键词 + 关联标签。
   # 重要原则：
     **内容原创化**：严禁在生成的内容中出现任何原文的平台名称、作者姓名、账号名、媒体机构名等标识信息。所有内容必须以原创形式呈现，避免版权纠纷。
   
  待处理内容：
  ---
  参考内容：${search_content
    .map((item: any) => `name:${item.name}\nsnippet:${item.snippet}`)
    .join("\n\n")}
  原文话题：${topics.join(",")}
  ---
  `;

  const result = streamText({
    model: google("gemini-2.5-pro"),
    prompt: prompt,
    temperature: 1.2,
  });

  let articleText = "";

  for await (const textPart of result.textStream) {
    articleText += textPart;
  }
  console.log(articleText);

  const articleJson = extractJsonFromText<{
    title: string;
    content: string;
    topic: string[];
  }>(articleText);

  if (!articleJson) {
    return new NextResponse(JSON.stringify({ error: "生成文章失败" }), {
      status: 500,
    });
  }
  return new NextResponse(
    JSON.stringify({
      title: articleJson?.title,
      content: articleJson?.content,
      topic: articleJson?.topic,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
