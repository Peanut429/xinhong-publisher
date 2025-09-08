"use client";

import { Button } from "@/components/ui/button";

export default function CanvasPage() {
  /**
   * 在 Canvas 中绘制自动换行的文本，支持中英文混合换行
   * @param {CanvasRenderingContext2D} context - Canvas 的 2D 上下文
   * @param {string} text - 需要绘制的完整文本
   * @param {number} y - 文本块起始 y 坐标
   * @param {number} maxWidth - 文本块的最大宽度
   * @param {number} lineHeight - 行高
   * @param {boolean} center - 是否水平居中
   */
  function wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    y: number,
    maxWidth: number,
    lineHeight: number,
    center: boolean = true
  ) {
    let line = "";
    let currentY = y;
    const padding = 150; // 左右固定间距
    const centeredWidth = context.canvas.width - 2 * padding; // 有效居中宽度

    for (let i = 0; i < text.length; i++) {
      let ch = text[i];
      let testLine = line + ch;
      let testWidth = context.measureText(testLine).width;

      // 如果是拉丁字符（英文），累积整个单词
      if (/[a-zA-Z]/.test(ch)) {
        let word = ch;
        while (i + 1 < text.length && /[a-zA-Z]/.test(text[i + 1])) {
          i++;
          word += text[i];
        }
        testLine = line + word;
        testWidth = context.measureText(testLine).width;
        if (testWidth > maxWidth && line !== "") {
          // 绘制当前行
          const lineWidth = context.measureText(line).width;
          const x = center
            ? padding + (centeredWidth - lineWidth) / 2
            : padding;
          context.fillText(line, x, currentY);
          line = "";
          currentY += lineHeight;
          testLine = word;
          testWidth = context.measureText(word).width;
        }
        // 如果单词本身超长，添加连字符拆分
        if (testWidth > maxWidth) {
          let charLine = "";
          for (let j = 0; j < word.length; j++) {
            const wordCh = word[j];
            const charTest = charLine + wordCh;
            const charMetrics = context.measureText(charTest).width;
            if (charMetrics > maxWidth && charLine !== "") {
              charLine += "-"; // 添加连字符
              const charLineWidth = context.measureText(charLine).width;
              const x = center
                ? padding + (centeredWidth - charLineWidth) / 2
                : padding;
              context.fillText(charLine, x, currentY);
              charLine = "";
              currentY += lineHeight;
            }
            charLine += wordCh;
          }
          line = charLine;
          continue;
        }
        line = testLine;
      } else {
        // 非英文（中文等），逐字符检查
        if (testWidth > maxWidth && line !== "") {
          const lineWidth = context.measureText(line).width;
          const x = center
            ? padding + (centeredWidth - lineWidth) / 2
            : padding;
          context.fillText(line, x, currentY);
          line = ch;
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
    }

    // 绘制最后一行
    if (line !== "") {
      const finalLineWidth = context.measureText(line).width;
      const finalX = center
        ? padding + (centeredWidth - finalLineWidth) / 2
        : padding;
      context.fillText(line, finalX, currentY);
    }
  }

  /**
   * 计算文本块的总高度
   * @param {CanvasRenderingContext2D} context - Canvas 的 2D 上下文
   * @param {string} text - 需要绘制的完整文本
   * @param {number} maxWidth - 文本块的最大宽度
   * @param {number} lineHeight - 行高
   * @returns {number} 文本块的总高度
   */
  function calculateTextHeight(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    lineHeight: number
  ): number {
    const words = text.split(" ");
    let line = "";
    let height = lineHeight; // 至少一行

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = line + word + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        height += lineHeight;
        line = word + " ";
      } else if (context.measureText(word).width > maxWidth) {
        // 如果单个单词超宽，逐字符处理
        let charLine = line;
        for (let j = 0; j < word.length; j++) {
          const ch = word[j];
          const charTest = charLine + ch;
          const charMetrics = context.measureText(charTest);
          if (charMetrics.width > maxWidth && charLine !== "") {
            height += lineHeight;
            charLine = ch;
          } else {
            charLine += ch;
          }
        }
        line = charLine + " ";
      } else {
        line = testLine;
      }
    }

    return height;
  }

  async function drawText() {
    // --- 使用示例 ---
    const canvas = document.getElementById("myCanvas")! as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    await drawImage();

    // 设置文本样式
    ctx.font = "bold 140px 'Noto Sans SC', 'Noto Sans', sans-serif";
    ctx.fillStyle = "#353233";

    // const text =
    //   "这是一段非常长的示例文本，用于演示在 Canvas 中如何实现自动换行功能。";
    const text = "gemini玩多了已经能倒背如流了";
    const maxWidth = 900;
    const lineHeight = 168;

    // 确保字体加载
    await document.fonts.load("bold 140px 'Noto Sans SC', 'Noto Sans'");

    // 计算垂直居中的起始 y
    const textHeight = calculateTextHeight(ctx, text, maxWidth, lineHeight);
    const canvasHeight = canvas.height;
    let y = (canvasHeight - textHeight) / 2 + lineHeight / 2; // 调整为文本块垂直居中

    wrapText(ctx, text, y, maxWidth, lineHeight, false); // 禁用水平居中，实现左对齐
  }

  function drawImage() {
    return new Promise((resolve) => {
      const canvas = document.getElementById("myCanvas")! as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const image = new Image();
      image.src = "/template.jpeg";
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
        resolve(true);
      };
    });
  }

  return (
    <div>
      <Button
        className="mb-10"
        onClick={() => {
          drawImage();
        }}
      >
        draw image
      </Button>
      <Button
        className="mb-10"
        onClick={() => {
          drawText();
        }}
      >
        draw text
      </Button>
      <canvas
        id="myCanvas"
        width="1200"
        height="1600"
        className="border w-[600px] h-[800px]"
      ></canvas>
    </div>
  );
}
