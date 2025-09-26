const templates = [
  {
    templateUrl:
      "https://yudeng-zhuiguang.oss-cn-shanghai.aliyuncs.com/watermark/%E5%9B%BE%E7%89%87%20%2835%29.png",
    prompt: (title: string) =>
      `把图中的文字“食品女生结局一览”替换为“${title}”，字体为宋体`,
  },
  {
    templateUrl:
      "https://yudeng-zhuiguang.oss-cn-shanghai.aliyuncs.com/watermark/1040g00831mbuk4la686g5o4lcme0bk6hl5pvmq0%21nc_n_webp_mw_1.webp",
    prompt: (title: string) =>
      `把图中的文字“为什么杭州小孩儿都不愿意去上海？”替换为“${title}”，字体为宋体`,
  },
];

export async function generateImageWithQwen(title: string, article: string) {
  const res = await fetch(
    "https://zhuiguang.socialads.cn/api/qwen/text2Image",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "App-Version": "1.0.0" },
      body: JSON.stringify({ title, article }),
    }
  ).then((res) => res.json());

  if (res.code !== 200) {
    throw new Error(res.message);
  }

  return res.data;
}

export async function editImageWithQwen(title: string) {
  const randomTemplate =
    templates[Math.floor(Math.random() * templates.length)];

  const res = await fetch(
    "https://zhuiguang.socialads.cn/api/qwen/image2Image",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "App-Version": "1.0.0" },
      body: JSON.stringify({
        title,
        prompt: randomTemplate.prompt(title),
        referenceImage: randomTemplate.templateUrl,
      }),
    }
  ).then((res) => res.json());

  if (res.code !== 200) {
    throw new Error(res.message);
  }

  return res.data;
}
