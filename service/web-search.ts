export async function webSearch(searchQuery: string) {
  const response = await fetch("http://47.100.99.13:8011/bing/search", {
    method: "POST",
    body: JSON.stringify({
      keyword: searchQuery,
      count: 10,
    }),
  });

  const data = await response.json();

  return data;
}
