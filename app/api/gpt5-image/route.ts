import { openai } from "@/utils/llm";
import { experimental_generateImage } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const result = await experimental_generateImage({
    model: openai.image("gpt-image-1"),
    prompt:
      "一张可爱涂鸦风格的 2D 数字插画卡片，竖直矩形布局，背景为带有轻微褶皱质感的浅白色纸面，四角圆润。画面中央是分为两行的大号简体中文文字“什么车贴看起来不好惹”，字体为深紫色手写风格，其中“滴滴“二字下方有浅紫色荧光笔高亮底纹。左上角绘有一条弯曲的浅紫色手绘箭头，右上角有几笔浅紫色随意波浪涂鸦，底部右侧有一条浅紫色手绘横线。横线之上放置一个卡通 emoji 表情，一位黄色头发、灰色上衣的小人俯身趴着，头上有三条灰色感叹符号表示紧张或尴尬。整体风格俏皮、趣味，带有手账和社交媒体配图的氛围",
  });

  // let resultText = "";
  // for await (const textPart of result.textStream) {
  //   resultText += textPart;
  // }

  return NextResponse.json({ result });
}
