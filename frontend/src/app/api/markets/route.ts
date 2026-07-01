import { NextResponse } from "next/server";

const markets = [
  {
    id: 101,
    title: "2026 World Cup Winner",
    category: "World Cup",
    tag: "Sports",
    volume: "$214.8K",
    liquidity: "$86.2K",
    closes: "Jul 13, 2026",
    outcomes: [
      { name: "France", price: 31, change: "+4.2%", side: "up" },
      { name: "Argentina", price: 24, change: "-1.1%", side: "down" },
      { name: "Brazil", price: 18, change: "+2.0%", side: "up" },
      { name: "England", price: 12, change: "-0.8%", side: "down" }
    ],
    spark: [20, 22, 24, 21, 28, 31, 29, 34, 33, 38, 36, 42],
    note: "Global football futures market using crowd liquidity and oracle settlement."
  },
  {
    id: 102,
    title: "BTC above $120K on Dec 31?",
    category: "Crypto",
    tag: "Price",
    volume: "$92.4K",
    liquidity: "$44.6K",
    closes: "Dec 31, 2026",
    outcomes: [
      { name: "Yes", price: 46, change: "+7.8%", side: "up" },
      { name: "No", price: 54, change: "-7.8%", side: "down" }
    ],
    spark: [62, 58, 51, 49, 44, 42, 45, 47, 43, 46, 50, 46],
    note: "Binary price range market with crypto settlement criteria."
  },
  {
    id: 103,
    title: "Which AI model tops coding benchmarks in Q3?",
    category: "AI",
    tag: "Benchmarks",
    volume: "$71.9K",
    liquidity: "$33.3K",
    closes: "Sep 30, 2026",
    outcomes: [
      { name: "OpenAI", price: 38, change: "+2.9%", side: "up" },
      { name: "Anthropic", price: 29, change: "-3.4%", side: "down" },
      { name: "Google", price: 21, change: "+1.7%", side: "up" },
      { name: "Other", price: 12, change: "-1.2%", side: "down" }
    ],
    spark: [18, 25, 23, 27, 31, 29, 33, 38, 35, 40, 37, 38],
    note: "Resolution uses public benchmark leaderboards and announced model releases."
  },
  {
    id: 104,
    title: "US Fed cuts rates before November?",
    category: "Economy",
    tag: "Macro",
    volume: "$53.2K",
    liquidity: "$25.8K",
    closes: "Nov 01, 2026",
    outcomes: [
      { name: "Yes", price: 57, change: "+1.4%", side: "up" },
      { name: "No", price: 43, change: "-1.4%", side: "down" }
    ],
    spark: [41, 45, 43, 48, 52, 49, 53, 55, 57, 54, 58, 57],
    note: "Macro policy market based on official Federal Reserve decisions."
  },
  {
    id: 105,
    title: "Most streamed summer album?",
    category: "Culture",
    tag: "Music",
    volume: "$38.0K",
    liquidity: "$16.9K",
    closes: "Aug 31, 2026",
    outcomes: [
      { name: "Artist A", price: 35, change: "+5.6%", side: "up" },
      { name: "Artist B", price: 31, change: "-2.2%", side: "down" },
      { name: "Artist C", price: 19, change: "+0.8%", side: "up" },
      { name: "Field", price: 15, change: "-4.2%", side: "down" }
    ],
    spark: [12, 16, 21, 18, 24, 25, 31, 29, 34, 33, 36, 35],
    note: "Culture market based on published streaming chart methodology."
  },
  {
    id: 106,
    title: "New major L2 reaches $10B TVL first?",
    category: "Crypto",
    tag: "Fundamentals",
    volume: "$61.7K",
    liquidity: "$28.4K",
    closes: "Oct 15, 2026",
    outcomes: [
      { name: "Base", price: 41, change: "+3.1%", side: "up" },
      { name: "Arbitrum", price: 32, change: "-1.8%", side: "down" },
      { name: "Optimism", price: 17, change: "+0.4%", side: "up" },
      { name: "Other", price: 10, change: "-1.7%", side: "down" }
    ],
    spark: [33, 35, 31, 36, 38, 41, 39, 44, 42, 45, 43, 41],
    note: "Resolution reads public DeFi TVL sources and chain announcements."
  }
];

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    source: "predicto-api",
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? null,
    network: process.env.NEXT_PUBLIC_GENLAYER_CHAIN ?? "studionet",
    updatedAt: new Date().toISOString(),
    markets
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== "string" || body.title.trim().length < 8) {
    return NextResponse.json({ error: "Market title must be at least 8 characters." }, { status: 400 });
  }
  if (typeof body.category !== "string" || body.category.trim().length < 2) {
    return NextResponse.json({ error: "Category is required." }, { status: 400 });
  }
  if (typeof body.outcomes !== "string" || body.outcomes.split(",").filter(Boolean).length < 2) {
    return NextResponse.json({ error: "Provide at least two comma-separated outcomes." }, { status: 400 });
  }

  const outcomeNames = body.outcomes
    .split(",")
    .map((item: string) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  const market = {
    id: Date.now(),
    title: body.title.trim(),
    category: body.category.trim(),
    tag: body.tag?.trim() || "Community",
    volume: "$0.00",
    liquidity: "$0.00",
    closes: body.closes?.trim() || "Open",
    outcomes: outcomeNames.map((name: string, index: number) => ({
      name,
      price: Math.max(5, Math.round(100 / outcomeNames.length) - index),
      change: "+0.0%",
      side: "up"
    })),
    spark: [18, 20, 19, 22, 24, 23, 25, 27, 26, 28, 29, 30],
    note:
      body.rules?.trim() ||
      "Community market created from the Predicto Arena terminal. Resolution should be checked against public sources and GenLayer oracle review."
  };

  return NextResponse.json({ source: "predicto-api", market }, { status: 201 });
}
