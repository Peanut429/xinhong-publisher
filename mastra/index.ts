import { Mastra } from "@mastra/core/mastra";
import { toutiaoArticleAgent } from "./agents/toutiao-article";

export const mastra = new Mastra({
  agents: {
    toutiaoArticleAgent,
  },
  telemetry: {
    enabled: true,
  },
});
