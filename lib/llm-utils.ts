export function extractJsonFromText<T>(text: string): T | null {
  const jsonRegex = /```json\s*(\{[\s\S]*\})\s*```/;
  const match = text.match(jsonRegex);
  if (match) {
    return JSON.parse(match[1]) as T;
  }
  return null;
}
