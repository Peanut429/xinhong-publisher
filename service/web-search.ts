interface BoChaValueItem {
  id: string;
  name: string;
  url: string;
  displayUrl: string;
  snippet: string;
  siteName: string;
  siteIcon: string;
  datePublished: string;
  dateLastCrawled: string;
}

export async function webSearch(keywords: string) {
  const response = await fetch("https://api.bochaai.com/v1/web-search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer sk-dff2e9dc60824e2f8c775c4649ad623d",
    },
    body: JSON.stringify({ query: keywords, count: 20, freshness: "oneMonth" }),
  });

  const data = await response.json();

  return (data.data.webPages.value as BoChaValueItem[]) ?? [];
}
