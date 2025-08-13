"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function GenerateArticle() {
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const handleGenerateArticle = async () => {
    const response = await fetch("/api/generate-article", {
      method: "POST",
    });
    const data = await response.json();
    setSearchQuery(data.search_query);
  };

  return (
    <div>
      <Button onClick={handleGenerateArticle}>Generate Article</Button>
      <div>{searchQuery}</div>
    </div>
  );
}
