import { NextResponse } from "next/server";

type Outcome = { name: string; price: number; change: string; side: "up" | "down" };
type Market = {
  id: number;
  title: string;
  category: string;
  tag: string;
  volume: string;
  liquidity: string;
  closes: string;
  outcomes: Outcome[];
  spark: number[];
  note: string;
  source: string;
  sourceUrl: string;
};

const fallbackMarkets: Market[] = [
  {
    id: 101,
    title: "BTC above current Binance mark +5% in 30 days?",
    category: "Crypto",
    tag: "Binance",
    volume: "$92.4K",
    liquidity: "$44.6K",
    closes: "30 days",
    outcomes: [
      { name: "Yes", price: 46, change: "+0.0%", side: "up" },
      { name: "No", price: 54, change: "+0.0%", side: "down" }
    ],
    spark: [62, 58, 51, 49, 44, 42, 45, 47, 43, 46, 50, 46],
    note: "Fallback market. Live Binance data was unavailable during this request.",
    source: "Fallback",
    sourceUrl: "https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints"
  }
];

const thematicMarkets: Market[] = [
  {
    id: 410,
    title: "2026 World Cup Winner market resolves from official FIFA result?",
    category: "World Cup",
    tag: "Football",
    volume: "$214.80K",
    liquidity: "$86.20K",
    closes: "Jul 19, 2026",
    outcomes: [
      { name: "France", price: 31, change: "+4.2%", side: "up" },
      { name: "Argentina", price: 24, change: "-1.1%", side: "down" },
      { name: "Brazil", price: 18, change: "+2.0%", side: "up" },
      { name: "England", price: 12, change: "-0.8%", side: "down" }
    ],
    spark: [20, 22, 24, 21, 28, 31, 29, 34, 33, 38, 36, 42],
    note: "Football prediction market. Resolution should use official FIFA tournament result pages and GenLayer source review.",
    source: "FIFA public result evidence",
    sourceUrl: "https://www.fifa.com/"
  },
  {
    id: 420,
    title: "Will a major central bank cut rates before November?",
    category: "Economy",
    tag: "Macro",
    volume: "$53.20K",
    liquidity: "$25.80K",
    closes: "Nov 01, 2026",
    outcomes: [
      { name: "Yes", price: 57, change: "+1.4%", side: "up" },
      { name: "No", price: 43, change: "-1.4%", side: "down" }
    ],
    spark: [41, 45, 43, 48, 52, 49, 53, 55, 57, 54, 58, 57],
    note: "Macro prediction market. Resolution uses official central-bank statements and GenLayer oracle review.",
    source: "Official macro source evidence",
    sourceUrl: "https://www.federalreserve.gov/"
  },
  {
    id: 430,
    title: "Will an AI model top public coding benchmarks in Q3?",
    category: "AI",
    tag: "Benchmarks",
    volume: "$71.90K",
    liquidity: "$33.30K",
    closes: "Sep 30, 2026",
    outcomes: [
      { name: "Yes", price: 52, change: "+2.9%", side: "up" },
      { name: "No", price: 48, change: "-2.9%", side: "down" }
    ],
    spark: [18, 25, 23, 27, 31, 29, 33, 38, 35, 40, 37, 38],
    note: "AI benchmark market. Resolution uses public leaderboard evidence and GenLayer consensus checks.",
    source: "Public benchmark evidence",
    sourceUrl: "https://huggingface.co/spaces"
  },
  {
    id: 440,
    title: "Will a top music release lead global streaming charts this summer?",
    category: "Culture",
    tag: "Music",
    volume: "$38.00K",
    liquidity: "$16.90K",
    closes: "Aug 31, 2026",
    outcomes: [
      { name: "Yes", price: 35, change: "+5.6%", side: "up" },
      { name: "No", price: 65, change: "-5.6%", side: "down" }
    ],
    spark: [12, 16, 21, 18, 24, 25, 31, 29, 34, 33, 36, 35],
    note: "Culture market resolved through public chart methodology and GenLayer source analysis.",
    source: "Public chart evidence",
    sourceUrl: "https://www.billboard.com/charts/"
  }
];

export const dynamic = "force-dynamic";

function money(value: number) {
  if (!Number.isFinite(value)) return "$0";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function probabilityFromChange(changePercent: number) {
  return Math.max(8, Math.min(92, Math.round(50 + changePercent * 1.6)));
}

async function fetchBinanceMarkets(errors: string[]): Promise<Market[]> {
  const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];
  const responses = await Promise.all(
    symbols.map(async (symbol) => {
      const globalUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
      const usUrl = `https://api.binance.us/api/v3/ticker/24hr?symbol=${symbol}`;
      try {
        let response = await fetch(globalUrl, {
          next: { revalidate: 30 }
        });
        let sourceUrl = globalUrl;
        let sourceName = "Binance 24hr ticker";
        if (!response.ok && response.status === 451) {
          response = await fetch(usUrl, { next: { revalidate: 30 } });
          sourceUrl = usUrl;
          sourceName = "Binance.US 24hr ticker";
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return { ...data, sourceUrl, sourceName };
      } catch (error) {
        errors.push(`Binance ${symbol} failed: ${error instanceof Error ? error.message : "unknown error"}`);
        return null;
      }
    })
  );

  return responses.filter(Boolean).map((item: any, index) => {
    const change = Number(item.priceChangePercent ?? 0);
    const yes = probabilityFromChange(change);
    const last = Number(item.lastPrice ?? 0);
    const volume = Number(item.quoteVolume ?? 0);
    const base = String(item.symbol ?? symbols[index]).replace("USDT", "");
    return {
      id: 200 + index,
      title: `${base} closes above ${money(last * 1.05)} in 30 days?`,
      category: "Crypto",
      tag: "Binance",
      volume: money(volume),
      liquidity: money(volume * 0.002),
      closes: "30 days",
      outcomes: [
        { name: "Yes", price: yes, change: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`, side: change >= 0 ? "up" : "down" },
        { name: "No", price: 100 - yes, change: `${change < 0 ? "+" : "-"}${Math.abs(change).toFixed(2)}%`, side: change < 0 ? "up" : "down" }
      ],
      spark: [42, 44, 41, 48, 46, 50, 52, 49, 55, 57, 54, yes],
      note: `Live ${item.sourceName}: last ${money(last)}, 24h change ${change.toFixed(2)}%. GenLayer oracle can resolve against public exchange market data.`,
      source: item.sourceName,
      sourceUrl: item.sourceUrl
    };
  });
}

async function fetchCoinGeckoMarkets(): Promise<Market[]> {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&per_page=3&page=1&sparkline=false&price_change_percentage=24h";
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error("CoinGecko markets failed");
  const coins = await response.json();

  return coins.map((coin: any, index: number) => {
    const change = Number(coin.price_change_percentage_24h ?? 0);
    const yes = probabilityFromChange(change);
    const price = Number(coin.current_price ?? 0);
    return {
      id: 300 + index,
      title: `${coin.name} market cap ranks top ${index + 1} next week?`,
      category: "Crypto",
      tag: "CoinGecko",
      volume: money(Number(coin.total_volume ?? 0)),
      liquidity: money(Number(coin.market_cap ?? 0) * 0.0001),
      closes: "7 days",
      outcomes: [
        { name: "Yes", price: yes, change: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`, side: change >= 0 ? "up" : "down" },
        { name: "No", price: 100 - yes, change: `${change < 0 ? "+" : "-"}${Math.abs(change).toFixed(2)}%`, side: change < 0 ? "up" : "down" }
      ],
      spark: [35, 38, 37, 41, 43, 42, 44, 47, 46, 49, 48, yes],
      note: `Live CoinGecko market data: ${coin.name} price ${money(price)}, market cap ${money(Number(coin.market_cap ?? 0))}. GenLayer can resolve using public aggregator evidence.`,
      source: "CoinGecko coins/markets",
      sourceUrl: url
    };
  });
}

function genlayerMarket(): Market {
  const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x99EeB36b0BbC46bc00227d16d0b884DD9940994f";
  return {
    id: 100,
    title: "Will this Predicto Arena GenLayer contract resolve a market?",
    category: "AI",
    tag: "GenLayer",
    volume: "$0.00",
    liquidity: "$0.00",
    closes: "Open",
    outcomes: [
      { name: "Resolved", price: 52, change: "+2.0%", side: "up" },
      { name: "Not resolved", price: 48, change: "-2.0%", side: "down" }
    ],
    spark: [40, 42, 43, 45, 44, 48, 50, 49, 52, 51, 53, 52],
    note: `GenLayer studionet contract ${contract}. The contract supports market factory, AMM buy/sell, liquidity, quotes, evidence logs, disputes, oracle resolution, and payout claims.`,
    source: "GenLayer studionet",
    sourceUrl: `https://studio.genlayer.com/`
  };
}

export async function GET() {
  let liveMarkets: Market[] = [];
  const errors: string[] = [];

  liveMarkets = liveMarkets.concat(await fetchBinanceMarkets(errors));

  try {
    liveMarkets = liveMarkets.concat(await fetchCoinGeckoMarkets());
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "CoinGecko failed");
  }

  const markets = [genlayerMarket(), ...thematicMarkets, ...(liveMarkets.length ? liveMarkets : fallbackMarkets)];

  return NextResponse.json({
    source: liveMarkets.length ? "live-market-apis" : "fallback",
    dataSources: ["GenLayer studionet", "Binance/Binance.US public REST", "CoinGecko public REST"],
    tradingView: "TradingView is intended for chart widgets/charting-library integration, not public REST market data.",
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? null,
    network: process.env.NEXT_PUBLIC_GENLAYER_CHAIN ?? "studionet",
    updatedAt: new Date().toISOString(),
    errors,
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

  const market: Market = {
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
      "Community market created from the Predicto Arena terminal. Resolution should be checked against public sources and GenLayer oracle review.",
    source: "Predicto user API",
    sourceUrl: "https://predicto-arena.vercel.app/api/markets"
  };

  return NextResponse.json({ source: "predicto-api", market }, { status: 201 });
}
