import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type FeedItem = {
  type: "score" | "fixture" | "news";
  headline: string;
  status?: string;
  source: string;
  url?: string;
};

const ESPN_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const ESPN_NEWS = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/news";

const fallbackItems: FeedItem[] = [
  {
    type: "fixture",
    headline: "World Cup 2026 board tracks qualified teams, host cities, fixtures, and official result evidence.",
    status: "Oracle watch",
    source: "Predicto Arena"
  },
  {
    type: "score",
    headline: "Winner market heat: France 31c, Argentina 24c, Brazil 18c, England 12c.",
    status: "Market odds",
    source: "Predicto Arena"
  },
  {
    type: "news",
    headline: "Host context live: USA, Canada, and Mexico weather feeds can support match-day prediction markets.",
    status: "Live context",
    source: "Open-Meteo + GenLayer"
  },
  {
    type: "fixture",
    headline: "Resolution rule: official FIFA public result pages plus GenLayer source review decide final outcome.",
    status: "GenLayer settlement",
    source: "GenLayer StudioNet"
  }
];

async function fetchJson(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "application/json",
      "user-agent": "PredictoArena/1.0"
    }
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

function normalizeScoreboard(payload: any): FeedItem[] {
  const events = Array.isArray(payload?.events) ? payload.events : [];
  return events.slice(0, 8).map((event: any) => {
    const competition = event?.competitions?.[0];
    const competitors = Array.isArray(competition?.competitors) ? competition.competitors : [];
    const left = competitors[0];
    const right = competitors[1];
    const leftName = left?.team?.shortDisplayName ?? left?.team?.displayName ?? "Team A";
    const rightName = right?.team?.shortDisplayName ?? right?.team?.displayName ?? "Team B";
    const leftScore = left?.score ?? "0";
    const rightScore = right?.score ?? "0";
    const shortStatus = competition?.status?.type?.shortDetail ?? competition?.status?.type?.description ?? event?.status?.type?.description;

    return {
      type: competition?.status?.type?.completed || competition?.status?.type?.state === "in" ? "score" : "fixture",
      headline: `${leftName} ${leftScore} - ${rightScore} ${rightName}`,
      status: shortStatus ?? event?.date ?? "World Cup schedule",
      source: "ESPN scoreboard",
      url: event?.links?.[0]?.href ?? "https://www.espn.com/soccer/"
    } as FeedItem;
  });
}

function normalizeNews(payload: any): FeedItem[] {
  const articles = Array.isArray(payload?.articles) ? payload.articles : [];
  return articles.slice(0, 10).map((article: any) => ({
    type: "news",
    headline: article?.headline ?? article?.description ?? "World Cup update",
    status: article?.published ? new Date(article.published).toLocaleDateString("en-US") : "Latest",
    source: "ESPN news",
    url: article?.links?.web?.href ?? article?.link ?? "https://www.espn.com/soccer/"
  }));
}

export async function GET() {
  const errors: string[] = [];
  const results = await Promise.allSettled([fetchJson(ESPN_SCOREBOARD), fetchJson(ESPN_NEWS)]);
  const items: FeedItem[] = [];

  if (results[0].status === "fulfilled") {
    items.push(...normalizeScoreboard(results[0].value));
  } else {
    errors.push(results[0].reason?.message ?? "Scoreboard unavailable");
  }

  if (results[1].status === "fulfilled") {
    items.push(...normalizeNews(results[1].value));
  } else {
    errors.push(results[1].reason?.message ?? "News unavailable");
  }

  const uniqueItems = items.filter((item, index, all) => index === all.findIndex((candidate) => candidate.headline === item.headline));
  const source = uniqueItems.length > 0 ? "live" : "fallback";

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    source,
    items: uniqueItems.length > 0 ? uniqueItems.slice(0, 14) : fallbackItems,
    errors
  });
}
