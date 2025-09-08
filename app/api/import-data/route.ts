import { db } from "@/db";
import { xinhongNotes } from "@/db/schema";
import { validateApiData } from "@/utils/validation";
import { inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "请提供有效的导入数据" },
        { status: 400 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "没有数据可以导入" }, { status: 400 });
    }

    // 使用统一的验证逻辑
    const { validData, errors } = validateApiData(data);

    if (validData.length === 0) {
      return NextResponse.json(
        {
          error: "没有有效的数据可以导入",
          details: errors,
        },
        { status: 400 }
      );
    }

    // 检查已存在的数据
    const validIds = validData.map((item) => item.id);
    const existingIds = await db
      .select({ id: xinhongNotes.id })
      .from(xinhongNotes)
      .where(inArray(xinhongNotes.id, validIds));

    const existingIdSet = new Set(existingIds.map((item) => item.id));

    // 过滤掉已存在的数据
    const newData = validData.filter((item) => !existingIdSet.has(item.id));
    const skippedData = validData.filter((item) => existingIdSet.has(item.id));

    // 批量插入新数据
    let insertedCount = 0;
    if (newData.length > 0) {
      try {
        await db.insert(xinhongNotes).values(newData);
        // .onConflictDoNothing({
        //   target: [xinhongNotes.id],
        // });
        insertedCount = newData.length;
      } catch (dbError) {
        console.error("数据库插入失败:", dbError);
        return NextResponse.json(
          {
            error: "数据保存到数据库失败",
            details: dbError instanceof Error ? dbError.message : "未知错误",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "数据导入完成",
      summary: {
        total: data.length,
        valid: validData.length,
        inserted: insertedCount,
        skipped: skippedData.length,
        errors: errors.length,
      },
      details: {
        skipped: skippedData.map((item) => ({
          id: item.id,
          title: item.title,
          reason: "数据已存在",
        })),
        errors: errors,
      },
    });
  } catch (error) {
    console.error("导入过程中发生错误:", error);
    return NextResponse.json(
      {
        error: "导入失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
