/**
 * 通用重试工具
 */

import { RETRY_CONFIG } from "../config";

/**
 * 带重试的异步函数执行器
 * @param fn 要执行的异步函数
 * @param operation 描述操作的字符串，用于日志
 * @param maxRetries 最大重试次数
 * @param delay 重试间隔时间（毫秒）
 * @returns Promise<T>
 */
export async function retryWithLogging<T>(
  fn: () => Promise<T>,
  operation: string,
  maxRetries: number = RETRY_CONFIG.MAX_RETRIES,
  delay: number = RETRY_CONFIG.RETRY_DELAY
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`${operation} (重试 ${attempt}/${maxRetries})...`);
      } else {
        console.log(`${operation}...`);
      }

      const result = await fn();

      if (attempt > 0) {
        console.log(`${operation} 成功`);
      }

      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(
        `${operation}失败 (尝试 ${attempt + 1}/${maxRetries + 1}):`,
        error
      );

      if (attempt < maxRetries) {
        console.log(`等待 ${delay}ms 后重试...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `${operation}失败，已重试 ${maxRetries} 次: ${lastError.message}`
  );
}

/**
 * 延迟函数
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 指数退避重试
 * @param fn 要执行的异步函数
 * @param operation 描述操作的字符串，用于日志
 * @param maxRetries 最大重试次数
 * @param baseDelay 基础延迟时间（毫秒）
 * @returns Promise<T>
 */
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  operation: string,
  maxRetries: number = RETRY_CONFIG.MAX_RETRIES,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delayTime = baseDelay * Math.pow(2, attempt - 1);
        console.log(
          `${operation} (重试 ${attempt}/${maxRetries})，等待 ${delayTime}ms...`
        );
        await delay(delayTime);
      } else {
        console.log(`${operation}...`);
      }

      const result = await fn();

      if (attempt > 0) {
        console.log(`${operation} 成功`);
      }

      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(
        `${operation}失败 (尝试 ${attempt + 1}/${maxRetries + 1}):`,
        error
      );

      if (attempt === maxRetries) {
        break;
      }
    }
  }

  throw new Error(
    `${operation}失败，已重试 ${maxRetries} 次: ${lastError.message}`
  );
}
