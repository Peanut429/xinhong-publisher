import { UsedDongchediLog } from "@/mastra/tools/search-used-dongchedi-info";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export async function recordUsedDongchediInfo(title: string) {
  const logPath = join(process.cwd(), "used-dongchedi-logs.json");

  const fileContent = await readFile(logPath, "utf-8");
  let logs: UsedDongchediLog[] = [];
  if (fileContent.trim()) {
    logs = JSON.parse(fileContent);
  }
  logs.push({ title, usedAt: new Date().getTime() });
  await writeFile(logPath, JSON.stringify(logs, null, 2));
}
