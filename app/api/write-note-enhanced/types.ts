/**
 * AI工作流增强版接口类型定义
 */

export interface SearchQuery {
  search_query: string;
  reason: string;
  topic: string[];
}

export interface Article {
  title: string;
  content: string;
  topic: string[];
}

export interface SellingPoint {
  selling_point_paragraph: string;
  topic: string[];
  reference_selling_point: {
    model: string;
    title: string;
    content: string;
  }[];
}

export interface ProcessResult {
  success: boolean;
  data?: {
    searchResult: any;
    note: any;
    articleJson: Article;
    sellingPointJson: SellingPoint;
    image: string;
    taskId: string;
  };
  processingTime?: number;
  timestamp?: string;
  error?: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface WebPageItem {
  name: string;
  snippet: string;
  url?: string;
}

export interface WebSearchResponse {
  code: number;
  data: {
    query: string;
    webPages: {
      value: WebPageItem[];
    };
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createTimestamp: number;
  comment: number;
  used: boolean;
}

export interface BotTask {
  id: string;
  accountId: string;
  platform: string;
  phoneNumber: string;
  reportId: string;
  title: string;
  images: string[];
  content: string;
  topic: string[];
  createTimestamp: number;
  updateTimestamp: number;
}
