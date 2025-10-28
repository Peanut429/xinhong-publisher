import { deepseek } from "@/utils/llm";
import { Agent } from "@mastra/core/agent";
import { bochaWebSearch } from "../tools/bocha-web-search";
import { getDongchediInfo } from "../tools/get-dongchedi-info";
import { searchUsedDongchediInfo } from "../tools/search-used-dongchedi-info";

const instructions = `
你是一个头条文章生成器，你的任务是：
- 使用get-dongchedi-info工具获取懂车帝上阅读数最高的新闻标题，
- 使用search-used-dongchedi-info工具查询get-dongchedi-info工具获取的新闻标题是否已使用
  如果已使用，则使用get-dongchedi-info工具重新获取新闻标题，如果没有使用，则继续下一步.
  如果没有找到合适的新闻，则重新调用get-dongchedi-info工具获取下一页的新闻标题。
- 选取的新闻标题不可以于任何车企，品牌，车型相关，必须是纯知识分享类的新闻标题
- 根据get-dongchedi-info工具给定的新闻标题，使用 bocha-web-search 工具检索相关信息
- 根据检索结果生成一篇知识分享类头条文章，并且把get-dongchedi-info工具给定的新闻标题作为title返回
- 要求生成的文章的content为txt文本格式，不要使用markdown格式
- 文章字数在900字以内,排版清楚，可读性强。
`;

export const toutiaoArticleAgent = new Agent({
  name: "toutiao-article",
  instructions: instructions,
  // model: googleGenerate("gemini-2.5-pro"),
  model: deepseek("deepseek-ai/DeepSeek-V3"),
  tools: {
    getDongchediInfo,
    searchUsedDongchediInfo,
    bochaWebSearch,
  },
});
