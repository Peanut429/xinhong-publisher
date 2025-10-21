/**
 * 图片生成服务模块（统一复用 service 层）
 */

import { rewriteText } from "@/service/generate-image";
import { retryWithLogging } from "../utils/retry";

/**
 * 生成图片
 * @param title 文章标题
 * @returns Promise<string> 图片 URL
 */
export async function generateImage(title: string): Promise<string> {
  return retryWithLogging(async () => {
    const url = await rewriteText(title);
    if (!url) {
      throw new Error("Failed to generate image");
    }
    return url;
  }, "生成图片");
}
