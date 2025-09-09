"use client";

import { Button } from "@/components/ui/button";
import {
  parseExcelFile,
  processExcelData,
  type ExcelRowData,
  type ProcessedExcelData,
} from "@/utils/excel";
import {
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

export default function ImportDataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExcelRowData[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedExcelData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewData([]);
    setProcessedData(null);
    setImportResult(null);

    try {
      setIsLoading(true);
      const rows = await parseExcelFile(selectedFile);
      setPreviewData(rows);

      // 处理数据并显示预览
      const result = processExcelData(rows);
      setProcessedData(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : "文件解析失败",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!processedData || processedData.success.length === 0) {
      return;
    }

    setIsLoading(true);
    setImportResult(null);

    try {
      const response = await fetch("/api/import-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: processedData.success,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          message: "数据导入成功！",
          details: result,
        });
      } else {
        setImportResult({
          success: false,
          message: result.error || "导入失败",
          details: result.details,
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: "网络错误，请重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setProcessedData(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">数据导入</h1>
        <p className="text-gray-600">选择Excel文件导入小红书笔记数据到数据库</p>
      </div>

      {/* 文件上传区域 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        {!file ? (
          <div className="space-y-4">
            <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">选择Excel文件</p>
              <p className="text-sm text-gray-500 mt-1">
                支持 .xlsx 和 .xls 格式，文件应包含必要的列标题
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              <Upload className="size-4 mr-2" />
              选择文件
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <div>
              <p className="text-lg font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                文件大小: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                重新选择
              </Button>
              <Button onClick={resetForm} variant="outline">
                重置
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>处理中...</span>
        </div>
      )}

      {/* 错误信息 */}
      {importResult && !importResult.success && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">导入失败</h3>
              <p className="text-sm text-red-700 mt-1">
                {importResult.message}
              </p>
              {importResult.details && (
                <pre className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded overflow-auto">
                  {JSON.stringify(importResult.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 成功信息 */}
      {importResult && importResult.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-green-800">导入成功</h3>
              <p className="text-sm text-green-700 mt-1">
                {importResult.message}
              </p>
              {importResult.details && (
                <div className="text-sm text-green-600 mt-2">
                  <p>总行数: {importResult.details.summary.total}</p>
                  <p>成功导入: {importResult.details.summary.success}</p>
                  <p>失败行数: {importResult.details.summary.errors}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 数据预览 */}
      {previewData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">数据预览</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                共 {previewData.length} 行数据
              </span>
              {processedData && (
                <span className="text-sm text-gray-500">
                  | 有效: {processedData.success.length} | 错误:{" "}
                  {processedData.errors.length}
                </span>
              )}
            </div>
          </div>

          {/* 数据表格 */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    行号
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    笔记标题
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    笔记Id
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, index) => {
                  const rowNumber = index + 2; // Excel行号从2开始
                  const hasError = processedData?.errors.some(
                    (e) => e.row === rowNumber
                  );

                  return (
                    <tr key={index} className={hasError ? "bg-red-50" : ""}>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {rowNumber}
                      </td>
                      <td
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate"
                        title={row["笔记标题"]}
                      >
                        {row["笔记标题"]}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 font-mono">
                        {row["笔记id"]}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {row["笔记分类"]}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {hasError ? (
                          <span className="text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            有错误
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            有效
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 错误详情 */}
          {processedData && processedData.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                数据验证错误 ({processedData.errors.length} 行)
              </h3>
              <div className="space-y-2">
                {processedData.errors.map((error, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    <span className="font-medium">第 {error.row} 行:</span>{" "}
                    {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 导入按钮 */}
          {processedData && processedData.success.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={handleImport}
                disabled={isLoading}
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Upload className="size-4 mr-2" />
                    导入到数据库 ({processedData.success.length} 条记录)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Excel文件格式要求
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            •
            第一行必须包含以下列标题：笔记标题、笔记id、笔记分类、笔记内容、话题、发布时间、账号昵称、账号主页链接、账号小红书号、点赞、收藏、评论
          </p>
          <p>• 话题列应为JSON字符串格式，如：["标签1", "标签2"]</p>
          <p>• 发布时间格式：YYYY-MM-DD HH:mm:ss</p>
          <p>• 笔记Id、笔记标题、笔记内容为必填字段</p>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-sm text-blue-600 mb-2">📥 下载示例数据文件：</p>
          <a
            href="/sample-data.csv"
            download="sample-data.csv"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            下载示例CSV文件
          </a>
          <p className="text-xs text-blue-500 mt-1">
            注意：您可以将CSV文件转换为Excel格式（.xlsx）后使用
          </p>
        </div>
      </div>
    </div>
  );
}
