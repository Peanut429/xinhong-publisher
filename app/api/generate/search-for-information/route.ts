import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords } = body ?? {};

    if (!keywords || typeof keywords !== "string") {
      return new NextResponse(
        JSON.stringify({ error: "Invalid request: 'keywords' is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.bochaai.com/v1/web-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: move API key to env var
        Authorization: "Bearer sk-dff2e9dc60824e2f8c775c4649ad623d",
      },
      body: JSON.stringify({
        query: keywords,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return new NextResponse(
        JSON.stringify({
          error: "Upstream web search failed",
          status: response.status,
          detail: text,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return new NextResponse(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(
      JSON.stringify({ error: "Internal error", message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
