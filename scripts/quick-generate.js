/**
 * 快速生成文章脚本
 * 简化版本，支持指定账号和文章数量
 *
 * 使用方法:
 * node scripts/quick-generate.js
 * node scripts/quick-generate.js --account 王佳玲 --count 3
 * node scripts/quick-generate.js --account all --count 2
 */

const {
  processAccount,
  CONFIG,
  generateArticle,
} = require("./batch-generate-articles");

// 账号配置
const phoneNumberMap = {
  "e61149df-e288-47f7-8ab6-111ddf145505": "15639880395",
  "8134e653-36c1-426f-b219-4318a7b2bfe6": "13142102709",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407f0": "18901643836",
  "55c8c668-54f3-4d31-a031-e9fa723c74aa": "18901764336",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407gh": "13386027991",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407gf": "18918722354",
};

const accountNames = {
  "e61149df-e288-47f7-8ab6-111ddf145505": "王娜",
  "8134e653-36c1-426f-b219-4318a7b2bfe6": "王佳玲",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407f0": "萤火",
  "55c8c668-54f3-4d31-a031-e9fa723c74aa": "七月",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407gh": "小李说车",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407gf": "梅子说车",
};

// 获取账号ID通过名称
function getAccountIdByName(name) {
  return Object.keys(accountNames).find((id) => accountNames[id] === name);
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    account: null,
    count: 1,
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace("--", "");
    const value = args[i + 1];

    if (key === "account") {
      params.account = value;
    } else if (key === "count") {
      params.count = parseInt(value) || 1;
    }
  }

  return params;
}

// 显示使用帮助
function showHelp() {
  console.log(`
🎯 快速生成文章脚本

使用方法:
  node scripts/quick-generate.js                              # 为王佳玲生成1篇文章
  node scripts/quick-generate.js --account 王娜 --count 3     # 为王娜生成3篇文章
  node scripts/quick-generate.js --account all --count 2      # 为所有账号各生成2篇文章

可用账号:
  ${Object.values(accountNames).join(", ")}

参数:
  --account  账号名称或'all'表示所有账号
  --count    每个账号生成的文章数量 (默认: 1)
  --help     显示此帮助信息
`);
}

// 处理单个账号（简化版）
async function processAccountQuick(accountId, count) {
  const phoneNumber = phoneNumberMap[accountId];
  const accountName = accountNames[accountId];

  console.log(`\n🚀 开始为 ${accountName} 生成 ${count} 篇文章...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    try {
      console.log(`📝 生成第 ${i + 1}/${count} 篇文章...`);

      const data = await generateArticle(accountId, phoneNumber);

      console.log(`✅ 成功 - 标题: ${data.note?.title || "无标题"}`);
      successCount++;

      // 请求间延迟
      if (i < count - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.REQUEST_DELAY)
        );
      }
    } catch (error) {
      console.error(`❌ 失败 - ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n📊 ${accountName} 完成: ✅${successCount} ❌${failCount}`);
  return { successCount, failCount };
}

// 主函数
async function main() {
  const params = parseArgs();

  // 显示帮助
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    showHelp();
    return;
  }

  console.log("⚡ 快速生成文章脚本启动");

  let accountsToProcess = [];

  if (params.account === "all") {
    // 处理所有账号
    accountsToProcess = Object.keys(phoneNumberMap);
    console.log(
      `📋 将为所有 ${accountsToProcess.length} 个账号各生成 ${params.count} 篇文章`
    );
  } else if (params.account) {
    // 处理指定账号
    const accountId = getAccountIdByName(params.account);
    if (!accountId) {
      console.error(`❌ 找不到账号: ${params.account}`);
      console.log(`可用账号: ${Object.values(accountNames).join(", ")}`);
      return;
    }
    accountsToProcess = [accountId];
    console.log(`📋 将为 ${params.account} 生成 ${params.count} 篇文章`);
  } else {
    // 默认处理王佳玲
    const defaultAccountId = "8134e653-36c1-426f-b219-4318a7b2bfe6";
    accountsToProcess = [defaultAccountId];
    console.log(
      `📋 将为 ${accountNames[defaultAccountId]} 生成 ${params.count} 篇文章`
    );
  }

  const startTime = Date.now();
  let totalSuccess = 0;
  let totalFail = 0;

  // 处理账号
  for (const accountId of accountsToProcess) {
    try {
      const result = await processAccountQuick(accountId, params.count);
      totalSuccess += result.successCount;
      totalFail += result.failCount;
    } catch (error) {
      console.error(
        `💥 处理账号 ${accountNames[accountId]} 时出错:`,
        error.message
      );
      totalFail += params.count;
    }

    // 账号间延迟
    if (accountsToProcess.length > 1) {
      console.log(
        `⏳ 等待 ${CONFIG.REQUEST_DELAY / 1000}s 后处理下一个账号...`
      );
      await new Promise((resolve) => setTimeout(resolve, CONFIG.REQUEST_DELAY));
    }
  }

  // 显示总结
  const totalTime = Date.now() - startTime;
  console.log("\n🎉 快速生成完成!");
  console.log(`⏱️  耗时: ${Math.round(totalTime / 1000)}s`);
  console.log(`✅ 成功: ${totalSuccess}篇`);
  console.log(`❌ 失败: ${totalFail}篇`);

  if (totalSuccess + totalFail > 0) {
    console.log(
      `📈 成功率: ${((totalSuccess / (totalSuccess + totalFail)) * 100).toFixed(
        1
      )}%`
    );
  }
}

// 运行脚本
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 脚本执行失败:", error);
    process.exit(1);
  });
}

module.exports = { main, processAccountQuick };
