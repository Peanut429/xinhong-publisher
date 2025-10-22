import { extractJsonFromText } from "@/lib/llm-utils";
import { mastra } from "@/mastra";
import { ToutiaoArticle } from "../types";

export async function generateToutiaoArticle(): Promise<ToutiaoArticle> {
  const result = await mastra.getAgent("toutiaoArticleAgent").generate(
    `帮我生成一篇头条文章  
  文章的输出格式为json格式，格式为：
  <output_format>
  {
    \`\`\`json
    {
      "title": "string",
      "content": "string",
      "topic": "string[]"
    }
    \`\`\`
  }
  </output_format>`
  );

  const articleJson = extractJsonFromText<ToutiaoArticle>(result.text);
  if (!articleJson) {
    throw new Error("Failed to parse article JSON");
  }
  return articleJson;
}
