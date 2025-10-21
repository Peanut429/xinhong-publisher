/**
 * AI工作流增强版接口路由
 * 重构后的模块化版本
 */

import { NextRequest, NextResponse } from "next/server";
import { RESPONSE_CONFIG } from "./config";
import { processNoteWithFallback } from "./processors/noteProcessor";

/**
 * POST /api/write-note-enhanced
 * 处理AI工作流请求，生成小红书笔记
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const requestBody = await request.json();
    const accountId = requestBody.accountId;
    const phoneNumber = requestBody.phoneNumber;

    // 参数验证
    if (!accountId || !phoneNumber) {
      return NextResponse.json(
        { error: "缺少必要的参数: accountId 或 phoneNumber" },
        {
          status: RESPONSE_CONFIG.BAD_REQUEST_STATUS,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("🚀 开始处理任务...");
    console.log(`👤 Account ID: ${accountId}, 📱 Phone: ${phoneNumber}`);

    // 主处理流程（仅增强重试，不改变返回结构）
    const result = await processNoteWithFallback({
      accountId,
      phoneNumber,
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ 任务处理完成，耗时: ${processingTime}ms`);

    // 老版直接返回顶层业务数据字段
    return NextResponse.json(result.data);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ 任务最终失败，耗时: ${processingTime}ms`, error);

    return NextResponse.json(
      {
        success: false,
        error: "任务处理失败",
        message: error instanceof Error ? error.message : "未知错误",
        processingTime,
        timestamp: new Date().toISOString(),
      },
      {
        status: RESPONSE_CONFIG.ERROR_STATUS,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
