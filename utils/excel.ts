import { NewXinhongNote } from "@/db/schema";
import * as XLSX from "xlsx";
import { validateExcelData, ValidationResult } from "./validation";

export interface ExcelRowData {
  笔记标题: string;
  笔记id: string;
  笔记分类: string;
  笔记内容: string;
  话题: string;
  发布时间: string;
  账号昵称: string;
  账号主页链接: string;
  账号小红书号: string;
  点赞: string;
  收藏: string;
  评论: string;
}

export interface ProcessedExcelData {
  success: NewXinhongNote[];
  errors: Array<{ row: number; error: string; data: any }>;
}

/**
 * 解析Excel文件内容
 */
export function parseExcelFile(file: File): Promise<ExcelRowData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // 获取第一个工作表
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 将工作表转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          reject(new Error("Excel文件至少需要包含标题行和一行数据"));
          return;
        }

        // 获取标题行
        const headers = jsonData[0] as string[];

        // 验证必要的列是否存在
        const requiredColumns = [
          "笔记标题",
          "笔记id",
          "笔记分类",
          "笔记内容",
          "话题",
          "发布时间",
          "账号昵称",
          "账号主页链接",
          "账号小红书号",
          "点赞",
          "收藏",
          "评论",
        ];

        const missingColumns = requiredColumns.filter(
          (col) => !headers.includes(col)
        );
        if (missingColumns.length > 0) {
          reject(new Error(`缺少必要的列: ${missingColumns.join(", ")}`));
          return;
        }

        // 转换数据行
        const rows: ExcelRowData[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length === 0 || row.every((cell) => !cell)) continue; // 跳过空行

          const rowData: ExcelRowData = {
            笔记标题: row[headers.indexOf("笔记标题")] || "",
            笔记id: row[headers.indexOf("笔记id")] || "",
            笔记分类: row[headers.indexOf("笔记分类")] || "",
            笔记内容: row[headers.indexOf("笔记内容")] || "",
            话题: row[headers.indexOf("话题")] || "",
            发布时间: row[headers.indexOf("发布时间")] || "",
            账号昵称: row[headers.indexOf("账号昵称")] || "",
            账号主页链接: row[headers.indexOf("账号主页链接")] || "",
            账号小红书号: row[headers.indexOf("账号小红书号")] || "",
            点赞: row[headers.indexOf("阅读")] || "",
            收藏: row[headers.indexOf("收藏")] || "",
            评论: row[headers.indexOf("评论")] || "",
          };

          rows.push(rowData);
        }

        resolve(rows);
      } catch (error) {
        reject(new Error(`解析Excel文件失败: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 转换Excel数据为数据库格式
 */
export function processExcelData(rows: ExcelRowData[]): ProcessedExcelData {
  // 使用统一的验证逻辑
  const validationResult: ValidationResult = validateExcelData(rows);

  // 转换错误格式以保持向后兼容
  const errors = validationResult.errors.map((error) => ({
    row: error.row || 0,
    error: error.error,
    data: error.data,
  }));

  return {
    success: validationResult.validData,
    errors: errors,
  };
}

/**
 * 生成导入结果报告
 */
export function generateImportReport(result: ProcessedExcelData): string {
  const { success, errors } = result;
  const totalRows = success.length + errors.length;

  let report = `导入完成！\n`;
  report += `总行数: ${totalRows}\n`;
  report += `成功导入: ${success.length} 行\n`;
  report += `失败行数: ${errors.length} 行\n`;

  if (errors.length > 0) {
    report += `\n失败详情:\n`;
    errors.forEach(({ row, error }) => {
      report += `第 ${row} 行: ${error}\n`;
    });
  }

  return report;
}
