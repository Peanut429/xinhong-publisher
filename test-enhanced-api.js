#!/usr/bin/env node

/**
 * 增强版AI工作流接口测试脚本
 *
 * 用法:
 * node test-enhanced-api.js
 *
 * 或者指定环境变量:
 * ACCOUNT_ID=123 PHONE_NUMBER=456789 node test-enhanced-api.js
 */

const API_URL = "http://localhost:3000/api/write-note-enhanced";

async function testEnhancedAPI() {
  console.log("🚀 开始测试增强版AI工作流接口...\n");

  // 从环境变量或默认值获取参数
  const accountId = process.env.ACCOUNT_ID || "test-account-123";
  const phoneNumber = process.env.PHONE_NUMBER || "13800138000";

  const requestBody = {
    accountId,
    phoneNumber,
  };

  console.log("📝 测试参数:");
  console.log(JSON.stringify(requestBody, null, 2));
  console.log();

  try {
    const startTime = Date.now();

    console.log("📡 发送请求到增强版接口...");
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    const totalTime = Date.now() - startTime;

    console.log(`⏱️  总耗时: ${totalTime}ms`);
    console.log(`📊 响应状态: ${response.status}`);
    console.log();

    if (result.success) {
      console.log("✅ 接口调用成功！");
      console.log("📋 返回数据:");

      console.log(`   🔍 搜索关键词: ${result.data.searchResult.data.query}`);
      console.log(`   📝 原笔记标题: ${result.data.note.title}`);
      console.log(`   📄 生成文章标题: ${result.data.articleJson.title}`);
      console.log(`   🖼️  生成图片URL: ${result.data.image}`);
      console.log(`   🆔 任务ID: ${result.data.taskId}`);
      console.log(`   ⏱️  处理时间: ${result.processingTime}ms`);

      console.log("\n📝 文章内容预览:");
      console.log(result.data.articleJson.content.substring(0, 200) + "...");

      console.log("\n💰 卖点内容预览:");
      console.log(
        result.data.sellingPointJson.selling_point_paragraph.substring(0, 200) +
          "..."
      );
    } else {
      console.log("❌ 接口调用失败:");
      console.log(`   错误信息: ${result.message}`);
      console.log(`   处理时间: ${result.processingTime}ms`);

      if (
        result.message.includes("所有") &&
        result.message.includes("篇笔记都处理失败")
      ) {
        console.log("\n💡 建议检查:");
        console.log("   1. 数据库中是否有可用的笔记（used = false）");
        console.log("   2. 检查各API服务的可用性");
        console.log("   3. 查看服务器日志了解详细错误信息");
      }
    }
  } catch (error) {
    console.error("❌ 请求失败:");
    console.error(`   错误: ${error.message}`);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 建议:");
      console.log("   1. 确保Next.js开发服务器正在运行");
      console.log("   2. 检查端口是否为3000");
      console.log("   3. 确认接口路径是否正确");
    }
  }

  console.log("\n🏁 测试完成");
}

// 如果直接运行此脚本
if (require.main === module) {
  testEnhancedAPI().catch(console.error);
}

module.exports = { testEnhancedAPI };
