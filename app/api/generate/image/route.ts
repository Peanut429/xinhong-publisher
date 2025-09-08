import { NextRequest, NextResponse } from "next/server";

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
  taskId: string;
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

// 查询任务历史记录的函数
async function getTaskHistory(taskId: string): Promise<HistoryItem | null> {
  try {
    const response = await fetch(
      "https://volcano-dev.socialads.cn/api/creative/task/history",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJvd05sTzVuNUJhZkZPVzRtaGFtYXdHVEw4dFJnIiwiZXhwaXJlVGltZXN0YW1wIjoxNzU1Njg2Mzk4ODIxfQ.1wpRgaF536Q3ROwSWL4g5PKDOw-k17Wmo_cb0PY_88g",
        },
        body: JSON.stringify({
          limit: 10,
          cursor: Date.now(),
          type: ["seedream_image_txt2img"],
        }),
      }
    );

    const result: HistoryListRes = await response.json();
    console.log(result);

    // 在历史记录中查找对应的任务
    const task = result.data.find((item) => item.taskId === taskId);
    console.log("task", task);

    return task || null;
  } catch (error) {
    console.error("Error fetching task history:", error);
    return null;
  }
}

// 轮询任务状态的函数
async function pollTaskStatus(
  taskId: string,
  maxAttempts: number = 5
): Promise<string[] | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(
      `Polling attempt ${attempt}/${maxAttempts} for task: ${taskId}`
    );

    const task = await getTaskHistory(taskId);

    if (task) {
      return task.results;
    }

    // 如果不是最后一次尝试，等待2秒
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerationRequest = await request.json();

    if (!body.prompt) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Prompt is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 构建请求参数，设置默认值
    const imageParams: T2IGenerateImageParam = {
      prompt: `淡黄色渐变背景，标题文本“${body.prompt}”，极简风格，文字居中清晰，字体加粗易读。。`,
      width: body.width || 1328,
      height: body.height || 1328,
      scale: body.scale || 2.5,
    };

    // 调用外部API
    const response = await fetch(
      "https://volcano-dev.socialads.cn/api/creative/seedream/txt2img",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJvd05sTzVuNUJhZkZPVzRtaGFtYXdHVEw4dFJnIiwiZXhwaXJlVGltZXN0YW1wIjoxNzU1Njg2Mzk4ODIxfQ.1wpRgaF536Q3ROwSWL4g5PKDOw-k17Wmo_cb0PY_88g",
        },
        body: JSON.stringify(imageParams),
      }
    );

    const result = await response.json();

    // 检查返回结果是否包含taskId (在data字段中)
    if (result && result.code === 200 && result.data) {
      const taskId = result.data;

      // 开始轮询任务状态，使用请求时的时间戳作为cursor
      const taskResults = await pollTaskStatus(taskId, 5);

      if (taskResults && taskResults.length > 0) {
        return new NextResponse(
          JSON.stringify({
            success: true,
            taskId: taskId,
            results: taskResults,
            message: "Image generation completed successfully",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // 任务未完成或失败
        return new NextResponse(
          JSON.stringify({
            success: false,
            taskId: taskId,
            error:
              "Task did not complete successfully within the polling period",
            message: "Please check the task status later",
          }),
          {
            status: 202, // Accepted but not completed
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else {
      // 如果没有taskId，直接返回原始结果
      return new NextResponse(
        JSON.stringify({
          success: true,
          ...result,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Image generation error:", error);

    return new NextResponse(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate image",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
