"use server";

import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { experimental_createMCPClient } from "ai";

export const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: "https://api.siliconflow.cn/v1",
});

export const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyA-uPFW2XeGHCkdwVS4kcgI7WwKbprOuJA",
  baseURL: "http://40.76.59.42/forward/google_api/stream/v1beta",
});

export async function createWebSearchMcpClient() {
  const sseTransport = new SSEClientTransport(
    new URL("https://mcp.bochaai.com/sse"),
    {
      requestInit: {
        headers: {
          Authorization: `Bearer ${process.env.BOCHA_API_KEY}`,
        },
      },
    }
  );

  const httpClient = await experimental_createMCPClient({
    transport: sseTransport,
    // transport: sseTransport,
    // transport: {
    //   type: "sse",
    //   url: "https://dashscope.aliyuncs.com/api/v1/mcps/WebSearch/sse",
    //   headers: {
    //     Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
    //   },
    // },
    // name: "阿里云百炼_联网搜索",
  });

  return httpClient;
}

export const webSearch = createDeepSeek({
  apiKey: "sk-dff2e9dc60824e2f8c775c4649ad623d",
  baseURL: "https://api.bochaai.com/v1/web-search",
});

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  baseURL: "http://40.76.59.42/forward/openai/v1",
});
