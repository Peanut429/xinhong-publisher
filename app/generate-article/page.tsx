"use client";

import { TextArea } from "@/components/base/textarea/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function GenerateArticle() {
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [topic, setTopic] = useState<string[]>([]);
  const [searchContent, setSearchContent] = useState<string>("");
  const [article, setArticle] = useState<{
    title: string;
    content: string;
    topic: string[];
  } | null>(null);

  const handleGenerateKeywords = async () => {
    const response = await fetch("/api/generate/keywords", {
      method: "POST",
    });
    const data = await response.json();
    setSearchQuery(data.search_query);
    setTopic(data.topic);
  };

  const handleGenerateArticle = async () => {
    const response = await fetch("/api/generate/article", {
      method: "POST",
      body: JSON.stringify({ search_query: searchQuery, topics: topic }),
    });
    const data = await response.json();
    setArticle(data);
  };

  return (
    <div className="max-w-[1024px] h-screen flex flex-col gap-4 p-5">
      <Button onClick={handleGenerateKeywords} className="w-fit">
        生成关键词
      </Button>
      {searchQuery && (
        <div className="flex">
          <div className="font-bold">关键词：</div>
          {searchQuery}
        </div>
      )}
      {topic.length > 0 ? (
        <div className="flex">
          <div className="font-bold">原文话题：</div>
          <div className="flex flex-wrap gap-2">
            {topic.map((t) => (
              <div key={t}>{t}</div>
            ))}
          </div>
        </div>
      ) : null}

      {searchQuery && (
        <div className="flex flex-col gap-2 w-full">
          <TextArea
            label="参考内容"
            textAreaClassName="bg-transparent"
            rows={10}
            value={searchContent}
            onChange={(e) => setSearchContent(e)}
          />
          <Button className="w-fit" onClick={handleGenerateArticle}>
            生成文章
          </Button>
        </div>
      )}
      {article && (
        <div className="flex flex-col gap-2 w-full">
          <div className="font-bold">标题：</div>
          <div>{article.title}</div>
          <div className="font-bold">内容：</div>
          <div>{article.content}</div>
          <div className="font-bold">话题：</div>
          <div className="flex flex-wrap gap-2">
            {article.topic.map((t) => (
              <div key={t}>{t}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
