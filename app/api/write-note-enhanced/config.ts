/**
 * AI工作流增强版接口配置
 */

// 重试配置
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 毫秒
  MAX_NOTES_TO_TRY: 5, // 最多尝试的笔记数量
} as const;

// API配置
export const API_CONFIG = {
  ENDPOINTS: {
    WEB_SEARCH: "https://api.bochaai.com/v1/web-search",
  },
  HEADERS: {
    AUTHORIZATION: "Bearer sk-dff2e9dc60824e2f8c775c4649ad623d",
    CONTENT_TYPE: "application/json",
  },
  TIMEOUT: 30000, // 30秒超时
} as const;

// 数据库配置
export const DB_CONFIG = {
  TABLES: {
    NOTES: "xinhongNotes",
    TASKS: "botTasks",
  },
} as const;

// 图片生成配置
export const IMAGE_CONFIG = {
  BASE_URL: "https://qianyi-aigc.tos-cn-shanghai.volces.com/",
  VOLCANO_API: "https://volcano.socialads.cn/api/creative/seedream",
  AUTHORIZATION:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJvd05sTzVraElzN2xQNEk4N0U5a3kxaU5fUnhNIiwiZXhwaXJlVGltZXN0YW1wIjoxNzU5MjM0ODk4MzgwfQ.YHuVJiCqFscyMXzMhlRJPG09HCn56CB37-6p7jcRuRc",
} as const;

// LLM配置
export const LLM_CONFIG = {
  MODEL: "deepseek-ai/DeepSeek-V3",
  BASE_URL: "https://api.siliconflow.cn/v1",
} as const;

// 响应配置
export const RESPONSE_CONFIG = {
  SUCCESS_STATUS: 200,
  ERROR_STATUS: 500,
  BAD_REQUEST_STATUS: 400,
} as const;

// 日志配置
export const LOG_CONFIG = {
  ENABLE_CONSOLE_LOG: true,
  LOG_LEVEL: "INFO", // DEBUG, INFO, WARN, ERROR
} as const;
