import selling_point from "./selling_point.json";
// 你是一个搜索专家，根据给定的小红书平台的笔记标题和笔记内容，生成一个搜索信息，用于在网络搜索相关内容。搜索信息用于在搜索引擎中搜索相关内容。
export function is_explicit_title(title: string, content: string) {
  return `
<role>你是一名专业的SEO分析师，擅长从社交媒体内容中挖掘用户的真实搜索意图，并生成高价值的搜索长尾词。</role>
<task_goal>
分析下面这篇小红书笔记，提取关键信息，并生成一份适用于百度、谷歌等搜索引擎的SEO搜索长尾词。
</task_goal>

<process_description>
1. 如果标题存在，标题可能模糊或明确，生成搜索查询的原则是：

  - 明确标题：如果标题直接包含关键词（如“提车验车”、“开车技巧”），搜索查询应直接基于这些关键词，总结核心主题。例如：
  标题：“新手不会提车验车的六大表现，看看你中了吗” → 核心主题是“新手买车注意事项”，搜索查询：“新手提车验车注意事项”或“提车验车常见错误”。
  原因：标题已点明主题（提车验车），搜索查询需覆盖核心内容，以获取实用信息。

  - 模糊标题：如果标题是故事性、情感化或隐晦的（如“当我陪朋友买车一直突然起身…”），需要推断潜在主题：
  分析关键词：提取标题中的关键词（如“陪朋友买车”、“突然起身”），思考上下文（可能涉及买车过程、行为建议或趣事）。
  参考原文内容：根据原文内容，推断潜在主题。

2. 如果标题不存在，则根据\`内容\`生成搜索信息
  - 如果内容也很模糊，则需要在结果中返回空字符串，并注明原因。
  - 你不可以根据模糊的内容，生成一个搜索信息。

3. 通用规则：
  查询应简洁：使用5-10个关键词，避免长句。
  覆盖核心：确保查询能获取标题相关的实用信息（如教程、清单、经验分享）。
  注意事项：搜索内容绝对不能包含具体的汽车品牌或者汽车车型。
  适配平台：小红书搜索偏好生活化、个人化内容，查询可加“技巧”、“经验”、“避坑”等词。

</process_description>

回答时请遵循：
- 直接返回搜索信息长尾词，不要有其他内容
- 关键词必须与小红书笔记内容相关，并且不能是具体的汽车品牌或者汽车型号。
- 搜索长尾词只能有一个，不要返回多个。
- 搜素信息用markdown的格式返回json信息，格式如下：
<output_format>
{
  \`\`\`json
  {
    "search_query": "string",
    "reason": "string"
  }
  \`\`\`
}
</output_format>

本次任务给定的笔记标题是：
<title>
${title}
</title>

本次任务给定的笔记内容是：
<content>
${content}
</content>
`;
}

export function generate_article(search_content: string) {
  return `你是一个小红书博主，你拥有卓越的互联网网感。你的写作风格非常的小红书化。
我在网络上搜索了一些参考信息，请根据以下参考内容，生成一篇小红书笔记。
参考内容：
<search_content>
${search_content}
</search_content>

小红书笔记的输出格式为json格式，格式为：
<output_format>
{
  \`\`\`json
  {
    "title": "string",
    "content": "string",
    "topic": "string[]"
  }
  \`\`\`
}
</output_format>

1. 笔记内容需要符合小红书平台的内容规范和风格， content中不需要携带话题标签。
2. topic中不能含有特殊字符，比如“空格”，“#”等符号。
3. 因为小红书平台的编辑器限制，段落之间必须要用两个换行符隔开才可以提现出段落感。
4. 笔记内容需要尽可能在合适的地方加一些表情符号，增加笔记的趣味性。
5. 笔记标题不能超过20个字符，一个中文算2个字符，英文和数组算一个字符，标题中不要出现emoji表情符号。
6. 笔记标题内容需要吸引人，标题党，可以用问句来引起读者的好奇心。
`;
}

export function generate_selling_point(article: string) {
  const prompt = `你是一个小红书博主，你拥有卓越的互联网网感。你的擅长在笔记的结尾插入广告主的推广内容。
请根据给出的笔记内容，在笔记的结尾添加一段与荣威卖点相近的段落，笔记的内容如下：。
<article>
${article}
</article>

荣威各车型的卖点信息如下, model是荣威的车型名称，title是荣威车型的卖点，content是荣威车型的卖点描述：
<selling_point>
${JSON.stringify(selling_point)}
</selling_point>

你只需要给出卖点推广段落的内容和话题标签，以及参考了什么卖点信息，结果以json信息返回，格式为：
<output_format>
{
  \`\`\`json
  {
    "selling_point_paragraph": "string",
    "topic": "string[]",
    "reference_selling_point": {
      "model": "string",
      "title": "string",
      "content": "string"
    }[]
  }
  \`\`\`
}
</output_format>
1. 参考的埋点信息选取同一款车型。
2. 卖点车型不能胡编乱造，必须是在卖点信息中的车型。
3. 卖点段落中必须包含具体车型和卖点信息， 卖点与车型必须与给出的卖点信息匹配，不能胡编乱造。
4. topic中不能含有特殊字符，比如“空格”，“#”等符号。
`;
  // console.log(prompt);
  return prompt;
}
