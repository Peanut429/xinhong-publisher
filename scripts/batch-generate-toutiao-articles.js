// import { google } from "@/utils/llm";
// import { streamText } from "ai";
// import {
//   experimental_createMCPClient as createMCPClient,
//   tool,
//   stepCountIs,
// } from "ai";
// import { webSearch } from "@/service/web-search";
// import { z } from "zod";

// console.log(process.env.BOCHA_API_KEY);

// const mcpClient = await createMCPClient({
//   transport: {
//     type: "sse",
//     url: "https://mcp.bochaai.com/sse",
//     headers: {
//       Authorization: `Bearer ${process.env.BOCHA_API_KEY}`,
//     },
//   },
// });

// async function generateToutiaoArticle(searchContent) {
//   const tools = await mcpClient.tools();
//   console.log(tools);
//   const result = streamText({
//     // model: deepseek("deepseek-ai/DeepSeek-V3"),
//     model: google("gemini-2.5-pro"),
//     tools: {
//       weather: tool({
//         description: `Search with Bocha Web Search and get enhanced search details from billions of web documents,
// including page titles, urls, summaries, site names, site icons, publication dates, image links, and more.
// Args:
//     query: Search query (required)
//     freshness: The time range for the search results. (Available options YYYY-MM-DD, YYYY-MM-DD..YYYY-MM-DD, noLimit, oneYear, oneMonth, oneWeek, oneDay. Default is noLimit)
//     count: Number of results (1-50, default 10)`,
//         inputSchema: z.object({
//           keywords: z.string().describe("search keywords"),
//         }),
//         execute: async ({ keywords }) => {
//           console.log(keywords);
//           const result = await webSearch(keywords);
//           return result;
//         },
//       }),
//     },
//     prompt: `你是一个头条文章生成器，你的任务是根据给定的搜索关键词，使用 Bocha Web Search 工具检索相关信息并根据检索结果生成一篇知识分享类头条文章,文章字数在900字以内,排版清楚，可读性强。
//   搜索关键词：${searchContent}
//   `,

//     temperature: 0.7,
//     maxSteps: 20, // 允许多步工具调用
//     stopWhen: stepCountIs(10),
//     onFinish: async () => {
//       await mcpClient.close();
//     },
//   });

//   console.log("等待输出");

//   let text = "";
//   for await (const textPart of result.textStream) {
//     console.log(textPart);
//     text += textPart;
//   }

//   return {
//     text: text,
//   };
// }

// generateToutiaoArticle(
//   "插混车不充电的代价有多大？老司机3笔账算得明明白白，结果惊人"
// );

/**
 * 批量生成文章脚本
 * 为所有账号自动生成指定数量的文章，支持重试机制
 */

const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;

// 账号配置（从page.tsx复制）
const phoneNumberMap = {
  "e61149df-e288-47f7-8ab6-111ddf145505": "15639880395", // 王娜
  "8134e653-36c1-426f-b219-4318a7b2bfe6": "13142102709", // 王佳玲
  "f60b7f06-ce6a-4ab4-8fbf-2737257407f0": "18901643836", // 萤火
  "55c8c668-54f3-4d31-a031-e9fa723c74aa": "18901764336", // 七月
  "f60b7f06-ce6a-4ab4-8fbf-2737257407gh": "13386027991", // 小李说车
  "f60b7f06-ce6a-4ab4-8fbf-2737257407gf": "18918722354", // 梅子说车
};

// 账号名称映射
const accountNames = {
  "e61149df-e288-47f7-8ab6-111ddf145505": "王娜",
  "8134e653-36c1-426f-b219-4318a7b2bfe6": "王佳玲",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407f0": "萤火",
  "55c8c668-54f3-4d31-a031-e9fa723c74aa": "七月",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407gh": "小李说车",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407gf": "梅子说车",
};

// 配置参数
const CONFIG = {
  ARTICLES_PER_ACCOUNT: 5, // 每个账号生成的文章数量
  MAX_RETRIES: 3, // 最大重试次数
  RETRY_DELAY: 2000, // 重试延迟（毫秒）
  REQUEST_DELAY: 3000, // 请求间延迟（毫秒）
  API_URL: `http://localhost:${port}/api/write-toutiao`, // API地址
  LOG_FILE: "batch-generate-toutiao-log.json", // 日志文件
};

/**
 * 重试函数
 */
async function retry(
  fn,
  maxRetries = CONFIG.MAX_RETRIES,
  delay = CONFIG.RETRY_DELAY
) {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries === 0) {
      throw error;
    }

    console.log(`⚠️  重试中... 剩余重试次数: ${maxRetries}`);
    await sleep(delay);
    return retry(fn, maxRetries - 1, delay);
  }
}

/**
 * 延迟函数
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 调用API生成文章
 */
async function generateArticle(accountId, phoneNumber, keywords) {
  const response = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accountId,
      phoneNumber,
      keywords,
    }),
  });

  if (!response.ok) {
    throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // 检查返回数据是否包含错误
  if (data.error) {
    throw new Error(`API返回错误: ${data.error}`);
  }

  return data;
}

/**
 * 保存文章到文件
 */
function saveArticle(accountName, articleIndex, data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${accountName}-article-${
    articleIndex + 1
  }-${timestamp}.json`;
  const filePath = path.join(__dirname, "generated-articles", fileName);

  // 确保目录存在
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 保存文章数据
  const articleData = {
    accountName,
    articleIndex: articleIndex + 1,
    timestamp,
    title: data.note?.title || "无标题",
    content: data.articleJson?.content || "无内容",
    sellingPoint: data.sellingPointJson?.selling_point_paragraph || "无卖点",
    topics: [
      ...(data.articleJson?.topic || []),
      ...(data.sellingPointJson?.topic || []),
    ],
    imageUrl: data.image
      ? `https://qianyi-aigc.tos-cn-shanghai.volces.com/${data.image}`
      : null,
    rawData: data,
  };

  fs.writeFileSync(filePath, JSON.stringify(articleData, null, 2), "utf8");
  return filePath;
}

/**
 * 记录日志
 */
function logResult(result) {
  const logPath = path.join(__dirname, CONFIG.LOG_FILE);
  let logs = [];

  // 读取现有日志
  if (fs.existsSync(logPath)) {
    try {
      const logContent = fs.readFileSync(logPath, "utf8");
      logs = JSON.parse(logContent);
    } catch (error) {
      console.warn("⚠️  读取日志文件失败，创建新日志");
    }
  }

  // 添加新日志
  logs.push({
    ...result,
    timestamp: new Date().toISOString(),
  });

  // 保存日志
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), "utf8");
}

/**
 * 处理单个账号
 */
async function processAccount(accountId) {
  const phoneNumber = phoneNumberMap[accountId];
  const accountName = accountNames[accountId];

  console.log(`\n🚀 开始处理账号: ${accountName} (${accountId})`);
  console.log(`📱 电话号码: ${phoneNumber}`);

  const results = {
    accountId,
    accountName,
    phoneNumber,
    success: [],
    failed: [],
    totalArticles: CONFIG.ARTICLES_PER_ACCOUNT,
  };

  for (let i = 0; i < CONFIG.ARTICLES_PER_ACCOUNT; i++) {
    console.log(
      `\n📝 生成第 ${i + 1}/${CONFIG.ARTICLES_PER_ACCOUNT} 篇文章...`
    );

    try {
      // 使用重试机制调用API
      const data = await retry(async () => {
        return await generateArticle(accountId, phoneNumber, keywords);
      });

      // 保存文章
      const filePath = saveArticle(accountName, i, data);

      const success = {
        articleIndex: i + 1,
        title: data.note?.title || "无标题",
        filePath,
        timestamp: new Date().toISOString(),
      };

      results.success.push(success);
      console.log(`✅ 文章生成成功: ${success.title}`);
      console.log(`💾 保存路径: ${filePath}`);
    } catch (error) {
      const failure = {
        articleIndex: i + 1,
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      results.failed.push(failure);
      console.error(`❌ 文章生成失败: ${error.message}`);
    }

    // 请求间延迟
    if (i < CONFIG.ARTICLES_PER_ACCOUNT - 1) {
      console.log(`⏳ 等待 ${CONFIG.REQUEST_DELAY / 1000}s 后继续...`);
      await sleep(CONFIG.REQUEST_DELAY);
    }
  }

  // 记录结果
  logResult(results);

  console.log(`\n📊 账号 ${accountName} 处理完成:`);
  console.log(`✅ 成功: ${results.success.length}篇`);
  console.log(`❌ 失败: ${results.failed.length}篇`);

  return results;
}

/**
 * 主函数
 */
async function main() {
  console.log("🎯 批量文章生成脚本启动");
  console.log(`📋 配置信息:`);
  console.log(`   - 账号数量: ${Object.keys(phoneNumberMap).length}`);
  console.log(`   - 每账号文章数: ${CONFIG.ARTICLES_PER_ACCOUNT}`);
  console.log(
    `   - 预计总文章数: ${
      Object.keys(phoneNumberMap).length * CONFIG.ARTICLES_PER_ACCOUNT
    }`
  );
  console.log(`   - 最大重试次数: ${CONFIG.MAX_RETRIES}`);
  console.log(`   - 请求间延迟: ${CONFIG.REQUEST_DELAY / 1000}s`);

  const startTime = Date.now();
  const allResults = [];

  // 处理所有账号
  for (const [accountId, phoneNumber] of Object.entries(phoneNumberMap)) {
    try {
      const result = await processAccount(accountId);
      allResults.push(result);
    } catch (error) {
      console.error(
        `💥 处理账号 ${accountNames[accountId]} 时发生未预期错误:`,
        error
      );
      allResults.push({
        accountId,
        accountName: accountNames[accountId],
        phoneNumber,
        success: [],
        failed: [{ error: error.message, timestamp: new Date().toISOString() }],
        totalArticles: CONFIG.ARTICLES_PER_ACCOUNT,
      });
    }

    // 账号间延迟
    console.log(
      `\n⏳ 等待 ${CONFIG.REQUEST_DELAY / 1000}s 后处理下一个账号...`
    );
    await sleep(CONFIG.REQUEST_DELAY);
  }

  // 生成总结报告
  const totalTime = Date.now() - startTime;
  const totalSuccess = allResults.reduce((sum, r) => sum + r.success.length, 0);
  const totalFailed = allResults.reduce((sum, r) => sum + r.failed.length, 0);
  const totalExpected = allResults.reduce((sum, r) => sum + r.totalArticles, 0);

  console.log("\n🎉 批量生成完成!");
  console.log("📊 总结报告:");
  console.log(`   ⏱️  总耗时: ${Math.round(totalTime / 1000)}s`);
  console.log(`   ✅ 成功文章: ${totalSuccess}篇`);
  console.log(`   ❌ 失败文章: ${totalFailed}篇`);
  console.log(`   📋 预期文章: ${totalExpected}篇`);
  console.log(
    `   📈 成功率: ${((totalSuccess / totalExpected) * 100).toFixed(1)}%`
  );

  // 保存总结报告
  const summaryPath = path.join(__dirname, "batch-generate-summary.json");
  const summary = {
    startTime: new Date(startTime).toISOString(),
    endTime: new Date().toISOString(),
    totalTime,
    totalSuccess,
    totalFailed,
    totalExpected,
    successRate: (totalSuccess / totalExpected) * 100,
    results: allResults,
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(`💾 详细报告已保存: ${summaryPath}`);
}

// 运行脚本
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 脚本执行失败:", error);
    process.exit(1);
  });
}

module.exports = {
  main,
  processAccount,
  generateArticle,
  CONFIG,
};
