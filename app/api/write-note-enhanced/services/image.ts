/**
 * 图片生成服务模块
 */

import { retryWithLogging } from "../utils/retry";

const templates = [
  {
    image: "images/6e739af7-77ed-4618-aac5-a039dca60f35.webp",
    prompt: (title: string) =>
      `将文本"实验室来了一对多模态情侣"修改为"${title}"，只修改文本，不要添加其他元素`,
  },
  {
    image: "images/591e2e73-e6e0-4f47-8971-16351c0008f4.png",
    prompt: (title: string) =>
      `将文本"食品女生结局一览"修改为"${title}"，只修改文本，不要添加其他元素`,
  },
];

/**
 * 生成图片
 * @param title 文章标题
 * @returns Promise<string> 图片URL
 */
export async function generateImage(title: string): Promise<string> {
  return retryWithLogging(async () => {
    const randomTemplate =
      templates[Math.floor(Math.random() * templates.length)];
    const prompt = randomTemplate.prompt(title);
    const image = randomTemplate.image;

    // 构建请求参数，设置默认值
    const imageParams = {
      prompt: prompt,
      image_urls: [image],
      req_key: "",
      scale: 0.5,
      seed: 0,
      width: 1200,
      height: 1600,
      batchSize: 1,
    };

    // 调用外部API
    const response = await fetch(
      "https://volcano.socialads.cn/api/creative/seedream/img2img/text-edit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJvd05sTzVraElzN2xQNEk4N0U5a3kxaU5fUnhNIiwiZXhwaXJlVGltZXN0YW1wIjoxNzU5MjM0ODk4MzgwfQ.YHuVJiCqFscyMXzMhlRJPG09HCn56CB37-6p7jcRuRc",
        },
        body: JSON.stringify(imageParams),
      }
    );

    const result = await response.json();

    if (result.code !== 200 || !result.data) {
      throw new Error("Failed to submit image generation task");
    }

    const taskId = result.data;

    // 轮询任务状态
    const imageUrl = await pollImageTaskStatus(taskId);

    if (!imageUrl) {
      throw new Error("Failed to generate image");
    }

    return imageUrl;
  }, "生成图片");
}

/**
 * 轮询图片生成任务状态
 * @param taskId 任务ID
 * @returns Promise<string | undefined>
 */
async function pollImageTaskStatus(
  taskId: string
): Promise<string | undefined> {
  let imageUrl = "";

  while (!imageUrl) {
    const image = await getImageTaskResult(taskId);

    if (image) {
      imageUrl = image;
      return image;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

/**
 * 获取图片任务结果
 * @param taskId 任务ID
 * @returns Promise<string | null>
 */
async function getImageTaskResult(taskId: string): Promise<string | null> {
  // 这里需要根据实际的API来实现
  // 暂时返回一个模拟的结果
  // TODO: 实现实际的图片任务查询逻辑
  return `task_${taskId}_result.jpg`;
}
