import { NextRequest, NextResponse } from "next/server";

type MarketContext = {
  title?: string;
  category?: string;
  closes?: string;
  volume?: string;
  liquidity?: string;
  rules?: string;
  outcomes?: Array<{
    name?: string;
    price?: number | string;
    change?: string;
  }>;
};

type AskPayload = {
  question?: string;
  market?: MarketContext | null;
  markets?: MarketContext[];
};

function clip(value: unknown, maxLength = 1600) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function buildContext(payload: AskPayload) {
  const selectedMarket = payload.market
    ? {
        title: payload.market.title,
        category: payload.market.category,
        closes: payload.market.closes,
        volume: payload.market.volume,
        liquidity: payload.market.liquidity,
        rules: clip(payload.market.rules, 1200),
        outcomes: payload.market.outcomes?.slice(0, 8)
      }
    : null;

  const marketList = (payload.markets ?? []).slice(0, 12).map((market) => ({
    title: market.title,
    category: market.category,
    closes: market.closes,
    volume: market.volume,
    liquidity: market.liquidity,
    outcomes: market.outcomes?.slice(0, 6)
  }));

  return { selectedMarket, marketList };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = (process.env.AI_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    return NextResponse.json({ error: "AI_API_KEY is not configured on the server." }, { status: 500 });
  }

  let payload: AskPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const question = payload.question?.trim();
  if (!question || question.length < 3) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.25,
        max_tokens: 900,
        messages: [
          {
            role: "system",
            content:
              "You are Predicto Arena's market analyst. Help users compare prediction markets, interpret odds, explain resolution rules, and identify uncertainty. In this product, an outcome price shown in cents is a rough implied probability: higher cents means the market is pricing that outcome as more likely. Be concise, practical, and explicit that this is not financial advice. Use only the provided market context when making market-specific claims."
          },
          {
            role: "user",
            content: JSON.stringify({ question, context: buildContext(payload) }, null, 2)
          }
        ]
      }),
      signal: controller.signal
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || "AI request failed.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (!answer || typeof answer !== "string") {
      return NextResponse.json({ error: "AI response did not include an answer." }, { status: 502 });
    }

    return NextResponse.json({ answer, model });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError" ? "AI request timed out." : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
