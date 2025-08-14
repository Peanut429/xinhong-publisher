import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";

export const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: "https://api.siliconflow.cn/v1",
});

export const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyA-uPFW2XeGHCkdwVS4kcgI7WwKbprOuJA",
  baseURL: "http://40.76.59.42/forward/google_api/stream/v1beta",
});

export const webSearch = createDeepSeek({
  apiKey: "sk-dff2e9dc60824e2f8c775c4649ad623d",
  baseURL: "https://api.bochaai.com/v1/web-search",
});
