"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface ResponseData {
  searchResult: SearchResult;
  note: Note;
  articleJson: ArticleJson;
  sellingPointJson: SellingPointJson;
  image: string;
}

interface SellingPointJson {
  selling_point_paragraph: string;
  topic: string[];
  reference_selling_point: Referencesellingpoint[];
}

interface Referencesellingpoint {
  model: string;
  title: string;
  content: string;
}

interface ArticleJson {
  title: string;
  content: string;
  topic: string[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createTimestamp: number;
  author: string;
  authorAccount: string;
  authorHomepage: string;
  noteClassification: string;
  used: boolean;
}

interface SearchResult {
  code: number;
  log_id: string;
  msg: null;
  data: Data;
}

interface Data {
  _type: string;
  queryContext: QueryContext;
  webPages: WebPages;
  images: Images;
  videos: null;
}

interface Images {
  id: null;
  readLink: null;
  webSearchUrl: null;
  value: Value2[];
  isFamilyFriendly: null;
}

interface Value2 {
  webSearchUrl: null;
  name: null;
  thumbnailUrl: string;
  datePublished: null;
  contentUrl: string;
  hostPageUrl: string;
  contentSize: null;
  encodingFormat: null;
  hostPageDisplayUrl: string;
  width: number;
  height: number;
  thumbnail: null;
}

interface WebPages {
  webSearchUrl: string;
  totalEstimatedMatches: number;
  value: Value[];
  someResultsRemoved: boolean;
}

interface Value {
  id: string;
  name: string;
  url: string;
  displayUrl: string;
  snippet: string;
  siteName: string;
  siteIcon: string;
  datePublished: string;
  dateLastCrawled: string;
  cachedPageUrl: null;
  language: null;
  isFamilyFriendly: null;
  isNavigational: null;
}

interface QueryContext {
  originalQuery: string;
}

const phoneNumberMap = {
  "e61149df-e288-47f7-8ab6-111ddf145505": "15639880395",
  "8134e653-36c1-426f-b219-4318a7b2bfe6": "13142102709",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407f0": "18901643836",
  "55c8c668-54f3-4d31-a031-e9fa723c74aa": "18901764336",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407gh": "13386027991",
  "f60b7f06-ce6a-4ab4-8fbf-2737257407gf": "18918722354",
};

export default function WritePage() {
  const [accountId, setAccountId] = useState(
    "8134e653-36c1-426f-b219-4318a7b2bfe6"
  );

  const [note, setNote] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const { mutate: writeNote, isPending } = useMutation({
    mutationFn: async (accountId: string) => {
      setNote(null);
      setImage(null);
      const res = await fetch("/api/write-note-enhanced", {
        method: "POST",
        body: JSON.stringify({
          accountId,
          phoneNumber: phoneNumberMap[accountId as keyof typeof phoneNumberMap],
        }),
      });
      return res.json();
    },
    onSuccess: (data: ResponseData) => {
      console.log(data);
      const noteInfo = [
        data.note.title,
        data.articleJson.content,
        data.sellingPointJson.selling_point_paragraph,
        [...data.articleJson.topic, ...data.sellingPointJson.topic]
          .map((t) => `#${t}`)
          .join(" "),
      ];
      setNote(noteInfo.join("\n\n\n"));
      setImage("https://qianyi-aigc.tos-cn-shanghai.volces.com/" + data.image);
      // setImage(data.image);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-5 overflow-y-auto">
      <div className="flex flex-col items-center justify-center gap-10 shrink-0">
        <RadioGroup
          className="flex gap-10"
          value={accountId}
          onValueChange={setAccountId}
        >
          <Label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="e61149df-e288-47f7-8ab6-111ddf145505" />
            王娜
          </Label>
          <Label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="8134e653-36c1-426f-b219-4318a7b2bfe6" />
            王佳玲
          </Label>
          <Label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="f60b7f06-ce6a-4ab4-8fbf-2737257407f0" />
            萤火
          </Label>
          <Label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="55c8c668-54f3-4d31-a031-e9fa723c74aa" />
            七月
          </Label>
          <Label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="f60b7f06-ce6a-4ab4-8fbf-2737257407gh" />
            小李说车
          </Label>
          <Label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="f60b7f06-ce6a-4ab4-8fbf-2737257407gf" />
            梅子说车
          </Label>
        </RadioGroup>
        <Button onClick={() => writeNote(accountId)} disabled={isPending}>
          {isPending ? "生成中..." : "生成笔记"}
        </Button>
      </div>

      {/* 笔记 */}
      <div className="grid grid-cols-[1fr_2fr] gap-2.5 px-10">
        {image && <img width={300} src={image} alt="" />}
        {note && <div className="whitespace-pre-wrap">{note}</div>}
      </div>
    </div>
  );
}
