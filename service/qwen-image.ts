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
