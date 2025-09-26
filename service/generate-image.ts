import { volcanoDb } from "@/db/volcano-db";
import { volcanoTasks } from "@/db/volcano-schema";
import { eq } from "drizzle-orm";

type T2IGenerateImageParam = {
  height: number;
  prompt: string;
  scale: number;
  width: number;
};

interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  scale?: number;
}

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type HistoryItem = {
  taskGroupId: string;
  createTimestamp: number;
  type: string;
  status: "not_submitted" | "queuing" | "running" | "succeeded" | "failed";
  describe: string;
  clientParam: T2IGenerateImageParam;
  userId: string;
  collected: boolean;
  queuePosition: number;
  results: string[];
};

type HistoryListRes = ApiResponse<HistoryItem[]>;

const templates = [
  {
    image: "images/6e739af7-77ed-4618-aac5-a039dca60f35.webp",
    prompt: (title: string) =>
      `将文本”实验室来了一对多模态情侣"修改为"${title}"，只修改文本，不要添加其他元素`,
  },
  {
    image: "images/591e2e73-e6e0-4f47-8971-16351c0008f4.png",
    prompt: (title: string) =>
      `将文本”食品女生结局一览"修改为"${title}"，只修改文本，不要添加其他元素`,
  },
];

export async function generateImage(title: string) {
  // 构建请求参数，设置默认值
  const imageParams = {
    prompt: `张可爱涂鸦风格的插画卡片，竖直短形布局，背景为带有轻微褶皱质感的浅白色纸面。画面中央是大号简体中文文字"${title}"，字体为深紫色手写风格，左上角绘有一条弯曲的浅紫色手绘箭头，右上角有几笔浅紫色随意波浪涂鸦，底部右侧有一条浅紫色手绘横线。横线之上放置一个卡通 emoji 表情--一位黄色头发、灰色上衣的小人俯身趴着，头上有三条灰色感叹符号表示紧张或尴尬。整体风格俏皮、趣味，带有手账和社交媒体配图的氛围。`,
    width: 1200,
    height: 1600,
    req_key: "jimeng_t2i_v30",
    use_pre_llm: false,
    batchSize: 1,
  };

  // 调用外部API
  const response = await fetch(
    // "https://volcano.socialads.cn/api/creative/seedream/img2img/text-edit",
    "https://volcano.socialads.cn/api/creative/seedream/txt2img",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJvd05sTzVraElzN2xQNEk4N0U5a3kxaU5fUnhNIiwiZXhwaXJlVGltZXN0YW1wIjoxNzU4MzY2NjQ1NDQ5fQ.v63Ju-wGQhMrKaf45gnIUHP9MW7Oi-TNOGKYpEANTpw",
      },
      body: JSON.stringify(imageParams),
    }
  );

  const result = await response.json();

  console.log("result: ", result);

  if (result.code !== 200 || !result.data) {
    throw new Error("Failed to submit task");
  }

  const taskId = result.data;

  const taskResults = await pollTaskStatus(taskId);

  if (!taskResults) {
    throw new Error("Failed to generate image");
  }

  return taskResults[0];
}

export async function rewriteText(title: string) {
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

  console.log("result: ", result);

  if (result.code !== 200 || !result.data) {
    throw new Error("Failed to submit task");
  }

  const taskId = result.data;

  const taskResults = await pollTaskStatus(taskId);

  console.log(taskResults);

  if (!taskResults) {
    throw new Error("Failed to generate image");
  }

  return taskResults[0];
}

async function pollTaskStatus(taskId: string): Promise<string[] | undefined> {
  let imageUrl = "";
  while (!imageUrl) {
    const image = await getTaskResult(taskId);

    if (image) {
      imageUrl = image;
      return [image];
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

// 查询任务历史记录的函数
async function getTaskHistory(taskId: string): Promise<HistoryItem | null> {
  try {
    const response = await fetch(
      "https://volcano.socialads.cn/api/creative/task/history",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJvd05sTzVraElzN2xQNEk4N0U5a3kxaU5fUnhNIiwiZXhwaXJlVGltZXN0YW1wIjoxNzU1Njg3MDk3ODY0fQ.bIw81zZ0soFD-BMcEWJ10qh76UEBA9nlhLV__xgFaXw",
        },
        body: JSON.stringify({
          limit: 10,
          cursor: Date.now(),
          type: ["seedream_image_txt2img"],
        }),
      }
    );

    const result: HistoryListRes = await response.json();

    // 在历史记录中查找对应的任务
    const task = result.data.find((item) => item.taskGroupId === taskId);

    return task || null;
  } catch (error) {
    console.error("Error fetching task history:", error);
    return null;
  }
}

async function getTaskResult(taskId: string) {
  const task = await volcanoDb
    .select()
    .from(volcanoTasks)
    .where(eq(volcanoTasks.taskGroupId, taskId));

  if (task.length === 0) {
    throw new Error("Task not found");
  }

  if (task[0].status === "succeeded") {
    return task[0].results[0];
  }

  if (task[0].status === "failed") {
    throw new Error("Task failed");
  }

  return null;
}
