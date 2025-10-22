import { SellingPoint } from "../write-note-enhanced/types";

export interface ToutiaoArticle {
  title: string;
  content: string;
  topic: string[];
}

export interface ToutiaoProcessResult {
  success: boolean;
  data?: {
    articleJson: ToutiaoArticle;
    sellingPointJson: SellingPoint;
    taskId: string;
  };
  processingTime?: number;
  timestamp?: string;
  error?: string;
  message?: string;
}
