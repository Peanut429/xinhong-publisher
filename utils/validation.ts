import { NewXinhongNote } from "@/db/schema";

export interface ValidationError {
  index?: number;
  row?: number;
  error: string;
  data?: any;
}

export interface ValidationResult {
  validData: NewXinhongNote[];
  errors: ValidationError[];
}

/**
 * 验证笔记数据的通用函数
 */
export function validateNoteData(
  data: any,
  index: number,
  context: "api" | "excel" = "api"
): { isValid: boolean; error?: string; processedData?: NewXinhongNote } {
  try {
    // 验证必填字段
    if (!data.id?.trim()) {
      return { isValid: false, error: "笔记Id不能为空" };
    }

    if (!data.content?.trim()) {
      return { isValid: false, error: "笔记内容不能为空" };
    }

    // 验证tags格式
    if (data.tags && !Array.isArray(data.tags)) {
      return { isValid: false, error: "话题字段必须是数组格式" };
    }

    // 验证时间戳格式
    if (data.createTimestamp && typeof data.createTimestamp !== "number") {
      return { isValid: false, error: "发布时间必须是有效的时间戳" };
    }

    // 处理数据
    const processedData: NewXinhongNote = {
      id: data.id.trim(),
      title: data.title?.trim() || "",
      content: data.content.trim(),
      tags: Array.isArray(data.tags) ? data.tags : [],
      createTimestamp: data.createTimestamp || 0,
      author: data.author?.trim() || "",
      authorAccount: data.authorAccount?.trim() || "",
      authorHomepage: data.authorHomepage?.trim() || "",
      noteClassification: data.noteClassification?.trim() || "",
      comment: parseNumber(data.comment, "comment"),
      like: parseNumber(data.like, "like"),
      collect: parseNumber(data.collect, "collect"),
      used: data.used ?? false,
    };

    return { isValid: true, processedData };
  } catch (error) {
    return {
      isValid: false,
      error: `数据格式错误: ${
        error instanceof Error ? error.message : "未知错误"
      }`,
    };
  }
}

/**
 * 批量验证API数据
 */
export function validateApiData(data: any[]): ValidationResult {
  const validData: NewXinhongNote[] = [];
  const errors: ValidationError[] = [];

  data.forEach((item, index) => {
    const result = validateNoteData(item, index, "api");

    if (result.isValid && result.processedData) {
      validData.push(result.processedData);
    } else {
      errors.push({
        index,
        error: result.error || "未知验证错误",
        data: item,
      });
    }
  });

  return { validData, errors };
}

function parseNumber(value: any, fieldName: string): number {
  const strValue = value?.toString().trim() || "0";
  const num = parseInt(strValue, 10);
  if (isNaN(num)) {
    throw new Error(`${fieldName}必须是有效的数字字符串`);
  }
  return num;
}

/**
 * 验证Excel行数据
 */
export function validateExcelRowData(
  row: any,
  rowIndex: number
): { isValid: boolean; error?: string; processedData?: NewXinhongNote } {
  try {
    // 验证必填字段
    if (!row["笔记id"]?.trim()) {
      return { isValid: false, error: "笔记id不能为空" };
    }

    if (!row["笔记内容"]?.trim()) {
      return { isValid: false, error: "笔记内容不能为空" };
    }

    // 验证话题格式（应该是JSON字符串）
    let tags: string[] = [];
    if (row["话题"]?.trim()) {
      try {
        const parsedTags = JSON.parse(row["话题"]);
        tags = Array.isArray(parsedTags) ? parsedTags : [parsedTags];
      } catch {
        return {
          isValid: false,
          error: "话题格式不正确，应该是有效的JSON字符串",
        };
      }
    }

    // 验证发布时间格式
    let createTimestamp = 0;
    if (row["发布时间"]?.trim()) {
      const timestamp = new Date(row["发布时间"]).getTime();
      if (isNaN(timestamp)) {
        return {
          isValid: false,
          error: "发布时间格式不正确，应该是 YYYY-MM-DD HH:mm:ss 格式",
        };
      }
      createTimestamp = timestamp;
    }

    // 创建数据库记录
    const processedData: NewXinhongNote = {
      id: row["笔记id"].trim(),
      title: row["笔记标题"]?.trim() || "",
      content: row["笔记内容"].trim(),
      tags: tags,
      createTimestamp: createTimestamp,
      author: row["账号昵称"]?.trim() || "",
      authorAccount: row["账号小红书号"]?.trim() || "",
      authorHomepage: row["账号主页链接"]?.trim() || "",
      noteClassification: row["笔记分类"]?.trim() || "",
      comment: parseNumber(row["评论"], "评论"),
      like: parseNumber(row["点赞"], "点赞"),
      collect: parseNumber(row["收藏"], "收藏"),
      used: false,
    };

    return { isValid: true, processedData };
  } catch (error) {
    return {
      isValid: false,
      error: `数据转换失败: ${
        error instanceof Error ? error.message : "未知错误"
      }`,
    };
  }
}

/**
 * 批量验证Excel数据
 */
export function validateExcelData(rows: any[]): ValidationResult {
  const validData: NewXinhongNote[] = [];
  const errors: ValidationError[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // Excel行号从2开始（第1行是标题）
    const result = validateExcelRowData(row, rowNumber);

    if (result.isValid && result.processedData) {
      validData.push(result.processedData);
    } else {
      errors.push({
        row: rowNumber,
        error: result.error || "未知验证错误",
        data: row,
      });
    }
  });

  return { validData, errors };
}
