/**
 * 示例使用脚本
 * 演示如何使用批量生成功能
 */

const { processAccount, CONFIG } = require("./batch-generate-articles");

// 示例1: 为单个账号生成文章
async function example1() {
  console.log("📝 示例1: 为王佳玲生成2篇文章");

  // 临时修改配置
  const originalCount = CONFIG.ARTICLES_PER_ACCOUNT;
  CONFIG.ARTICLES_PER_ACCOUNT = 2;

  try {
    const result = await processAccount("8134e653-36c1-426f-b219-4318a7b2bfe6");
    console.log("✅ 示例1完成:", result);
  } catch (error) {
    console.error("❌ 示例1失败:", error.message);
  } finally {
    // 恢复原配置
    CONFIG.ARTICLES_PER_ACCOUNT = originalCount;
  }
}

// 示例2: 使用自定义重试配置
async function example2() {
  console.log("📝 示例2: 使用自定义重试配置");

  const { retry } = require("../utils/retry");
  const { generateArticle } = require("./batch-generate-articles");

  const accountId = "f60b7f06-ce6a-4ab4-8fbf-2737257407f0"; // 萤火
  const phoneNumber = "18901643836";

  try {
    const result = await retry(
      () => generateArticle(accountId, phoneNumber),
      5, // 最大重试5次
      1500 // 1.5秒延迟
    );

    console.log("✅ 示例2完成:", result.note?.title || "无标题");
  } catch (error) {
    console.error("❌ 示例2失败:", error.message);
  }
}

// 示例3: 批量处理指定账号
async function example3() {
  console.log("📝 示例3: 批量处理汽车类账号");

  const carAccounts = [
    "f60b7f06-ce6a-4ab4-8fbf-2737257407gh", // 小李说车
    "f60b7f06-ce6a-4ab4-8fbf-2737257407gf", // 梅子说车
  ];

  // 临时修改配置
  const originalCount = CONFIG.ARTICLES_PER_ACCOUNT;
  CONFIG.ARTICLES_PER_ACCOUNT = 1;

  const results = [];

  try {
    for (const accountId of carAccounts) {
      console.log(`处理账号: ${accountId}`);
      const result = await processAccount(accountId);
      results.push(result);

      // 账号间延迟
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("✅ 示例3完成:", results.length, "个账号处理完成");
  } catch (error) {
    console.error("❌ 示例3失败:", error.message);
  } finally {
    CONFIG.ARTICLES_PER_ACCOUNT = originalCount;
  }
}

// 运行示例
async function runExamples() {
  console.log("🚀 开始运行示例...\n");

  // 运行示例1
  await example1();
  console.log("\n" + "=".repeat(50) + "\n");

  // 运行示例2
  await example2();
  console.log("\n" + "=".repeat(50) + "\n");

  // 运行示例3
  await example3();

  console.log("\n🎉 所有示例运行完成!");
}

// 如果直接运行此脚本
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
📚 示例使用脚本

用法:
  node scripts/example-usage.js           # 运行所有示例
  node scripts/example-usage.js 1         # 运行示例1
  node scripts/example-usage.js 2         # 运行示例2  
  node scripts/example-usage.js 3         # 运行示例3

示例说明:
  示例1: 为单个账号生成指定数量文章
  示例2: 使用自定义重试配置
  示例3: 批量处理特定类型账号
`);
    process.exit(0);
  }

  const exampleNum = args[0];

  if (exampleNum === "1") {
    example1().catch(console.error);
  } else if (exampleNum === "2") {
    example2().catch(console.error);
  } else if (exampleNum === "3") {
    example3().catch(console.error);
  } else {
    runExamples().catch(console.error);
  }
}

module.exports = {
  example1,
  example2,
  example3,
  runExamples,
};
