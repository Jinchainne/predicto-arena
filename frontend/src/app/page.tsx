"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bot,
  BrainCircuit,
  ChartCandlestick,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Flame,
  Gauge,
  Gift,
  Globe2,
  Medal,
  Plus,
  CloudSun,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trophy,
  Wallet,
  Zap
} from "lucide-react";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

type Market = {
  id: number;
  title: string;
  category: string;
  tag: string;
  volume: string;
  liquidity: string;
  closes: string;
  outcomes: Array<{ name: string; price: number; change: string; side: "up" | "down" }>;
  spark: number[];
  note: string;
  source?: string;
  sourceUrl?: string;
  onchainStatus?: string;
  onchainLiquidityCents?: number;
  onchainVolumeCents?: number;
  onchainBalanceGEN?: string;
  evidenceCount?: number;
  disputeCount?: number;
  resolutionNote?: string;
};

type WeatherSnapshot = {
  location: string;
  timezone: string;
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    wind_speed_10m?: number;
    weather_code?: number;
    time?: string;
  };
  units?: Record<string, string>;
  source: string;
};

type WorldCupFeedItem = {
  type: "score" | "fixture" | "news";
  headline: string;
  status?: string;
  source: string;
  url?: string;
};

type CreateMarketState = {
  title: string;
  category: string;
  tag: string;
  closes: string;
  outcomes: string;
  rules: string;
};

type Position = {
  id: string;
  marketTitle: string;
  outcome: string;
  side: "buy" | "sell" | "liquidity";
  amount: number;
  price: number;
  shares: number;
  createdAt: string;
};

type OnchainMarketSnapshot = {
  marketId: number | null;
  exists: boolean;
  status: string;
  liquidityCents: number;
  volumeCents: number;
  balanceGEN: string;
  evidenceCount: number;
  disputeCount: number;
  resolvedOutcome: number;
  resolutionNote: string;
  pricesByOutcome: Record<string, number>;
  poolsByOutcome: Record<string, number>;
  userPositionsByOutcome: Record<string, number>;
  liquidityPositionCents: number;
};

type Mission = {
  id: string;
  title: string;
  reward: number;
  progress: number;
  target: number;
  claimed: boolean;
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  providers?: EthereumProvider[];
};

type WalletKind = "metamask" | "rabby" | "okx";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x99EeB36b0BbC46bc00227d16d0b884DD9940994f";
const STUDIO_CHAIN_ID = "0xf22f";
const STUDIO_RPC_URL = "https://studio.genlayer.com/api";
const GENLAYER_SNAP_ID = "npm:genlayer-wallet-plugin";
const GENLAYER_STUDIO_URL = "https://studio.genlayer.com/";
const readClient = createClient({ chain: studionet });

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    okxwallet?: EthereumProvider;
    rabby?: EthereumProvider;
  }
}

const categories = ["All", "World Cup", "Crypto", "AI", "Politics", "Economy", "Sports", "Culture", "New"];
const navItems = ["Markets", "Portfolio", "Leaderboard", "Earn Tickets"];
const navIcons = { Markets: ChartCandlestick, Portfolio: ShoppingCart, Leaderboard: Trophy, "Earn Tickets": Gift };
const categoryIcons = { All: Globe2, "World Cup": Trophy, Crypto: Coins, AI: BrainCircuit, Politics: ShieldCheck, Economy: CircleDollarSign, Sports: Medal, Culture: Sparkles, New: Flame };
const walletOptions: Array<{ id: WalletKind; label: string }> = [
  { id: "metamask", label: "MetaMask" },
  { id: "rabby", label: "Rabby" },
  { id: "okx", label: "OKX" }
];
const categoryImages: Record<string, string> = {
  "World Cup": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1400&q=80",
  Crypto: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=1400&q=80",
  AI: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
  Politics: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=80",
  Economy: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=80",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80",
  Culture: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80",
  New: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
  All: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1400&q=80"
};

const worldCupImages = [
  {
    title: "Knockout night in North America",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=85",
    detail: "Round of 32 pressure, host-city weather, and crowd momentum."
  },
  {
    title: "Golden Boot and star markets",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=85",
    detail: "Player form and matchups can move probabilities before kickoff."
  },
  {
    title: "Host nation futures",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=85",
    detail: "USA, Canada, and Mexico markets can use local conditions as context."
  },
  {
    title: "Underdog breakout board",
    image: "https://images.unsplash.com/photo-1552318965-6e6be7484ada?auto=format&fit=crop&w=1200&q=85",
    detail: "Debutants and returnees create high-volatility prediction opportunities."
  },
  {
    title: "Group stage volatility",
    image: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?auto=format&fit=crop&w=1200&q=85",
    detail: "Third-place rules, goal difference, and late goals can move markets fast."
  },
  {
    title: "Final path simulator",
    image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=85",
    detail: "Bracket paths, travel distance, rest days, and climate all affect favorites."
  },
  {
    title: "Supporter energy index",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=85",
    detail: "Home crowds, fan travel, and stadium energy shape momentum markets."
  },
  {
    title: "Training ground watch",
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=85",
    detail: "Injury reports, training intensity, and tactical setups feed oracle evidence."
  },
  {
    title: "Stadium climate board",
    image: "https://images.unsplash.com/photo-1504016798967-59a258e9386d?auto=format&fit=crop&w=1200&q=85",
    detail: "Heat, rain, wind, and turf conditions can change match tempo."
  }
];

const worldCupClips = [
  {
    title: "FIFA World Cup 2026 Trailer",
    platform: "YouTube",
    id: "91htvvcIurs"
  },
  {
    title: "This is FIFA World Cup 26",
    platform: "YouTube",
    id: "ZTdOX1U2K0Q"
  }
];

const worldCupTeams = [
  { name: "Canada", code: "CAN", group: "Host" },
  { name: "Mexico", code: "MEX", group: "Host" },
  { name: "USA", code: "USA", group: "Host" },
  { name: "Japan", code: "JPN", group: "AFC" },
  { name: "IR Iran", code: "IRN", group: "AFC" },
  { name: "Uzbekistan", code: "UZB", group: "AFC" },
  { name: "South Korea", code: "KOR", group: "AFC" },
  { name: "Jordan", code: "JOR", group: "AFC" },
  { name: "Australia", code: "AUS", group: "AFC" },
  { name: "Qatar", code: "QAT", group: "AFC" },
  { name: "Saudi Arabia", code: "KSA", group: "AFC" },
  { name: "Iraq", code: "IRQ", group: "AFC" },
  { name: "Morocco", code: "MAR", group: "CAF" },
  { name: "Tunisia", code: "TUN", group: "CAF" },
  { name: "Egypt", code: "EGY", group: "CAF" },
  { name: "Algeria", code: "ALG", group: "CAF" },
  { name: "Ghana", code: "GHA", group: "CAF" },
  { name: "Ivory Coast", code: "CIV", group: "CAF" },
  { name: "Senegal", code: "SEN", group: "CAF" },
  { name: "South Africa", code: "RSA", group: "CAF" },
  { name: "Cabo Verde", code: "CPV", group: "CAF" },
  { name: "DR Congo", code: "COD", group: "CAF" },
  { name: "Argentina", code: "ARG", group: "CONMEBOL" },
  { name: "Brazil", code: "BRA", group: "CONMEBOL" },
  { name: "Ecuador", code: "ECU", group: "CONMEBOL" },
  { name: "Colombia", code: "COL", group: "CONMEBOL" },
  { name: "Uruguay", code: "URU", group: "CONMEBOL" },
  { name: "Paraguay", code: "PAR", group: "CONMEBOL" },
  { name: "New Zealand", code: "NZL", group: "OFC" },
  { name: "Panama", code: "PAN", group: "CONCACAF" },
  { name: "Haiti", code: "HAI", group: "CONCACAF" },
  { name: "Curacao", code: "CUW", group: "CONCACAF" },
  { name: "England", code: "ENG", group: "UEFA" },
  { name: "France", code: "FRA", group: "UEFA" },
  { name: "Croatia", code: "CRO", group: "UEFA" },
  { name: "Norway", code: "NOR", group: "UEFA" },
  { name: "Portugal", code: "POR", group: "UEFA" },
  { name: "Germany", code: "GER", group: "UEFA" },
  { name: "Netherlands", code: "NED", group: "UEFA" },
  { name: "Switzerland", code: "SUI", group: "UEFA" },
  { name: "Scotland", code: "SCO", group: "UEFA" },
  { name: "Spain", code: "ESP", group: "UEFA" },
  { name: "Belgium", code: "BEL", group: "UEFA" },
  { name: "Austria", code: "AUT", group: "UEFA" },
  { name: "Turkey", code: "TUR", group: "UEFA" },
  { name: "Czech Republic", code: "CZE", group: "UEFA" },
  { name: "Sweden", code: "SWE", group: "UEFA" },
  { name: "Bosnia and Herzegovina", code: "BIH", group: "UEFA" }
];

const countryFlags: Record<string, string> = {
  CAN: "ðŸ‡¨ðŸ‡¦",
  MEX: "ðŸ‡²ðŸ‡½",
  USA: "ðŸ‡ºðŸ‡¸",
  JPN: "ðŸ‡¯ðŸ‡µ",
  IRN: "ðŸ‡®ðŸ‡·",
  UZB: "ðŸ‡ºðŸ‡¿",
  KOR: "ðŸ‡°ðŸ‡·",
  JOR: "ðŸ‡¯ðŸ‡´",
  AUS: "ðŸ‡¦ðŸ‡º",
  QAT: "ðŸ‡¶ðŸ‡¦",
  KSA: "ðŸ‡¸ðŸ‡¦",
  IRQ: "ðŸ‡®ðŸ‡¶",
  MAR: "ðŸ‡²ðŸ‡¦",
  TUN: "ðŸ‡¹ðŸ‡³",
  EGY: "ðŸ‡ªðŸ‡¬",
  ALG: "ðŸ‡©ðŸ‡¿",
  GHA: "ðŸ‡¬ðŸ‡­",
  CIV: "ðŸ‡¨ðŸ‡®",
  SEN: "ðŸ‡¸ðŸ‡³",
  RSA: "ðŸ‡¿ðŸ‡¦",
  CPV: "ðŸ‡¨ðŸ‡»",
  COD: "ðŸ‡¨ðŸ‡©",
  ARG: "ðŸ‡¦ðŸ‡·",
  BRA: "ðŸ‡§ðŸ‡·",
  ECU: "ðŸ‡ªðŸ‡¨",
  COL: "ðŸ‡¨ðŸ‡´",
  URU: "ðŸ‡ºðŸ‡¾",
  PAR: "ðŸ‡µðŸ‡¾",
  NZL: "ðŸ‡³ðŸ‡¿",
  PAN: "ðŸ‡µðŸ‡¦",
  HAI: "ðŸ‡­ðŸ‡¹",
  CUW: "ðŸ‡¨ðŸ‡¼",
  ENG: "ðŸ´",
  FRA: "ðŸ‡«ðŸ‡·",
  CRO: "ðŸ‡­ðŸ‡·",
  NOR: "ðŸ‡³ðŸ‡´",
  POR: "ðŸ‡µðŸ‡¹",
  GER: "ðŸ‡©ðŸ‡ª",
  NED: "ðŸ‡³ðŸ‡±",
  SUI: "ðŸ‡¨ðŸ‡­",
  SCO: "ðŸ´",
  ESP: "ðŸ‡ªðŸ‡¸",
  BEL: "ðŸ‡§ðŸ‡ª",
  AUT: "ðŸ‡¦ðŸ‡¹",
  TUR: "ðŸ‡¹ðŸ‡·",
  CZE: "ðŸ‡¨ðŸ‡¿",
  SWE: "ðŸ‡¸ðŸ‡ª",
  BIH: "ðŸ‡§ðŸ‡¦"
};

const countryIso: Record<string, string> = {
  CAN: "ca", MEX: "mx", USA: "us", JPN: "jp", IRN: "ir", UZB: "uz", KOR: "kr", JOR: "jo",
  AUS: "au", QAT: "qa", KSA: "sa", IRQ: "iq", MAR: "ma", TUN: "tn", EGY: "eg", ALG: "dz",
  GHA: "gh", CIV: "ci", SEN: "sn", RSA: "za", CPV: "cv", COD: "cd", ARG: "ar", BRA: "br",
  ECU: "ec", COL: "co", URU: "uy", PAR: "py", NZL: "nz", PAN: "pa", HAI: "ht", CUW: "cw",
  ENG: "gb-eng", FRA: "fr", CRO: "hr", NOR: "no", POR: "pt", GER: "de", NED: "nl", SUI: "ch",
  SCO: "gb-sct", ESP: "es", BEL: "be", AUT: "at", TUR: "tr", CZE: "cz", SWE: "se", BIH: "ba"
};

const categoryThemes: Record<string, {
  kicker: string;
  hero: string;
  description: string;
  sources: string[];
  cards: Array<{ label: string; title: string; detail: string; image: string }>;
}> = {
  AI: {
    kicker: "AI benchmark desk",
    hero: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=85",
    description: "Model releases, benchmark boards, eval suites, and official lab posts become oracle evidence.",
    sources: ["Benchmarks", "Model cards", "Lab releases", "Public leaderboards"],
    cards: [
      { label: "Eval", title: "Benchmark movement", detail: "Track coding, reasoning, and multimodal score changes.", image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85" },
      { label: "Release", title: "Model launch radar", detail: "Official announcements can change probabilities instantly.", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=85" },
      { label: "Oracle", title: "Source review queue", detail: "GenLayer can inspect public evidence during resolution.", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=85" }
    ]
  },
  Culture: {
    kicker: "Culture market desk",
    hero: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85",
    description: "Streaming charts, festival schedules, film rankings, and public cultural indexes replace financial charts.",
    sources: ["Streaming charts", "Box office", "Festival data", "Public rankings"],
    cards: [
      { label: "Music", title: "Streaming chart pulse", detail: "Weekly public charts drive music and artist markets.", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=85" },
      { label: "Cinema", title: "Box office race", detail: "Revenue and release calendars create event-driven movement.", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85" },
      { label: "Events", title: "Festival signal board", detail: "Lineups, awards, and attendance can resolve culture markets.", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=85" }
    ]
  },
  Economy: {
    kicker: "Macro event terminal",
    hero: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=85",
    description: "Central bank decisions, inflation prints, employment reports, and public statistics power macro markets.",
    sources: ["Central banks", "CPI releases", "Jobs data", "Treasury calendars"],
    cards: [
      { label: "Rates", title: "Policy countdown", detail: "Meeting calendars and official statements shape rate markets.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=85" },
      { label: "Inflation", title: "CPI print watch", detail: "Public statistical releases become settlement evidence.", image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=85" },
      { label: "Labor", title: "Jobs report board", detail: "Employment reports create high-volatility forecast windows.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=85" }
    ]
  },
  Politics: {
    kicker: "Public policy desk",
    hero: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=85",
    description: "Official votes, agency pages, public statements, and court calendars support political prediction markets.",
    sources: ["Official records", "Court calendars", "Agency releases", "Election boards"],
    cards: [
      { label: "Vote", title: "Legislative outcome", detail: "Bills, roll calls, and official records determine settlement.", image: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=900&q=85" },
      { label: "Policy", title: "Agency announcement", detail: "Public releases can create binary policy outcomes.", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=85" },
      { label: "Election", title: "Result evidence", detail: "Election boards and certified results become oracle sources.", image: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=900&q=85" }
    ]
  },
  Sports: {
    kicker: "Sports event desk",
    hero: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=85",
    description: "Scores, fixtures, injury reports, and official league result pages power sports markets.",
    sources: ["Scoreboards", "League pages", "Team reports", "Fixture lists"],
    cards: [
      { label: "Live", title: "Scoreboard pulse", detail: "Official scores and game status move event prices.", image: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=85" },
      { label: "Teams", title: "Injury and lineup watch", detail: "Team reports can explain pre-match probability swings.", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=85" },
      { label: "Oracle", title: "Official result source", detail: "Final settlement should cite league or federation result pages.", image: "https://images.unsplash.com/photo-1505843279827-4b5226b2c190?auto=format&fit=crop&w=900&q=85" }
    ]
  },
  New: {
    kicker: "New market launchpad",
    hero: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85",
    description: "Fresh markets show source plans, close windows, liquidity goals, and GenLayer resolution routes.",
    sources: ["Market rules", "Evidence links", "Oracle route", "Liquidity"],
    cards: [
      { label: "Launch", title: "Market intake", detail: "Every new market needs clear title, outcomes, and rules.", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=900&q=85" },
      { label: "Rules", title: "Resolution preview", detail: "Rules are visible before users commit liquidity or trades.", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=85" },
      { label: "Risk", title: "Oracle readiness", detail: "Source quality determines whether markets are safe to settle.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85" }
    ]
  }
};

const seedMarkets: Market[] = [
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

const leaderboard = [
  { address: "0x75...A7Dd", volume: 18420, pnl: 22.4, tickets: 920 },
  { address: "0x11...9Caf", volume: 14880, pnl: 18.7, tickets: 760 },
  { address: "0x92...Bee1", volume: 11506, pnl: 15.1, tickets: 640 },
  { address: "0x33...F010", volume: 9774, pnl: 11.8, tickets: 510 }
];

function sparkPath(values: number[]) {
  const width = 220;
  const height = 80;
  const max = Math.max(...values);
  const min = Math.min(...values);
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / Math.max(1, max - min)) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Markets");
  const [activeCategory, setActiveCategory] = useState("All");
  const [marketData, setMarketData] = useState<Market[]>(seedMarkets);
  const [dataStatus, setDataStatus] = useState<"loading" | "live" | "fallback">("loading");
  const [dataSources, setDataSources] = useState<string[]>([]);
  const [contractAddress, setContractAddress] = useState("0x99EeB36b0BbC46bc00227d16d0b884DD9940994f");
  const [network, setNetwork] = useState("studionet");
  const [activeMarketId, setActiveMarketId] = useState(seedMarkets[0].id);
  const [tradeOutcome, setTradeOutcome] = useState(seedMarkets[0].outcomes[0].name);
  const [tradeSide, setTradeSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [amount, setAmount] = useState("25");
  const [limitPrice, setLimitPrice] = useState("50");
  const [slippage, setSlippage] = useState("1.0");
  const [liquidityAmount, setLiquidityAmount] = useState("100");
  const [txSteps, setTxSteps] = useState<string[]>(["Connect wallet", "Switch StudioNet", "Submit order"]);
  const [drawerTab, setDrawerTab] = useState("Trade");
  const [marketView, setMarketView] = useState<"Markets" | "Outcomes" | "Volume">("Markets");
  const [search, setSearch] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const [genBalance, setGenBalance] = useState("0.0000");
  const [walletChain, setWalletChain] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<WalletKind>("metamask");
  const [walletName, setWalletName] = useState("MetaMask");
  const [createMarket, setCreateMarket] = useState<CreateMarketState>({
    title: "Will GenLayer ship a new public testnet milestone in Q3?",
    category: "AI",
    tag: "GenLayer",
    closes: "Sep 30, 2026",
    outcomes: "Yes, No",
    rules: "Resolve Yes if GenLayer publishes an official public testnet milestone announcement before the close date. Otherwise resolve No."
  });
  const [creatingMarket, setCreatingMarket] = useState(false);
  const [tradeStatus, setTradeStatus] = useState("");
  const [tradeBusy, setTradeBusy] = useState(false);
  const [liquidityBusy, setLiquidityBusy] = useState(false);
  const [walletSnapReady, setWalletSnapReady] = useState<boolean | null>(null);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<"idle" | "loading" | "live" | "error">("idle");
  const [worldCupFeed, setWorldCupFeed] = useState<WorldCupFeedItem[]>([]);
  const [worldCupFeedStatus, setWorldCupFeedStatus] = useState<"loading" | "live" | "fallback">("loading");
  const [aiQuestion, setAiQuestion] = useState("Explain the resolution risk for this market.");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState("https://predicto-arena.vercel.app/api/markets");
  const [evidenceNote, setEvidenceNote] = useState("Submitted evidence for oracle review.");
  const [disputeNote, setDisputeNote] = useState("Please re-check the outcome against the submitted evidence and rules.");
  const [oracleBusy, setOracleBusy] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [oracleStatus, setOracleStatus] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [activeOnchainMarket, setActiveOnchainMarket] = useState<OnchainMarketSnapshot | null>(null);
  const [portfolioBusy, setPortfolioBusy] = useState(false);
  const [onchainStatus, setOnchainStatus] = useState("Loading contract state...");
  const [tickets, setTickets] = useState(0);
  const [missions, setMissions] = useState<Mission[]>([
    { id: "trade-3", title: "Trade three active markets", reward: 40, progress: 0, target: 3, claimed: false },
    { id: "liquidity-100", title: "Submit $100 trading volume", reward: 55, progress: 0, target: 100, claimed: false },
    { id: "oracle-review", title: "Review an oracle source", reward: 25, progress: 0, target: 1, claimed: false },
    { id: "create-market", title: "Create one market", reward: 35, progress: 0, target: 1, claimed: false }
  ]);
  const [feed, setFeed] = useState<string[]>(["Market terminal online", "Oracle route: GenLayer web consensus", "Wallet simulation ready"]);

  useEffect(() => {
    let cancelled = false;

    async function loadMarkets() {
      try {
        const response = await fetch("/api/markets", { cache: "no-store" });
        if (!response.ok) throw new Error("Market API failed");
        const payload = await response.json();
        const nextMarkets = Array.isArray(payload.markets) ? payload.markets : [];
        if (!cancelled && nextMarkets.length > 0) {
          setMarketData(nextMarkets);
          setDataSources(Array.isArray(payload.dataSources) ? payload.dataSources : []);
          setContractAddress(payload.contractAddress || "0x99EeB36b0BbC46bc00227d16d0b884DD9940994f");
          setNetwork(payload.network || "studionet");
          const matchingMarket = nextMarkets.find((market: Market) => activeCategory === "All" || market.category === activeCategory || market.tag === activeCategory) ?? nextMarkets[0];
          setActiveMarketId(matchingMarket.id);
          setTradeOutcome(matchingMarket.outcomes[0]?.name ?? "");
          setDataStatus("live");
          setFeed((items) => ["Loaded live market API data", ...items].slice(0, 6));
        }
      } catch {
        if (!cancelled) {
          setDataStatus("fallback");
          setFeed((items) => ["Market API unavailable, using seed market data", ...items].slice(0, 6));
        }
      }
    }

    loadMarkets();
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  useEffect(() => {
    const saved = window.localStorage.getItem("predicto-session");
    if (!saved) return;
    try {
      const session = JSON.parse(saved);
      if (Array.isArray(session.missions)) setMissions(session.missions);
      if (Array.isArray(session.feed)) setFeed(session.feed);
      if (typeof session.tickets === "number") setTickets(session.tickets);
    } catch {
      window.localStorage.removeItem("predicto-session");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("predicto-session", JSON.stringify({ missions, feed, tickets }));
  }, [feed, missions, tickets]);

  useEffect(() => {
    if (!window.ethereum?.on) return;
    const handleAccountsChanged = (...args: any[]) => {
      const accounts = Array.isArray(args[0]) ? args[0] : [];
      const nextAddress = typeof accounts[0] === "string" ? accounts[0] : "";
      setWalletAddress(nextAddress);
      if (nextAddress) {
        setWalletError("");
        setFeed((items) => [`Wallet connected ${shortAddress(nextAddress)}`, ...items].slice(0, 6));
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
  }, []);

  const filteredMarkets = useMemo(() => {
    return marketData.filter((market) => {
      const categoryMatch = activeCategory === "All" || market.category === activeCategory || market.tag === activeCategory;
      const searchMatch = market.title.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, marketData, search]);

  const activeMarket = marketData.find((market) => market.id === activeMarketId) ?? marketData[0] ?? seedMarkets[0];
  const activeIsFootball = isFootballMarket(activeMarket);
  const displayOutcomes = useMemo(() => activeIsFootball ? buildWorldCupOutcomes(activeMarket) : activeMarket.outcomes, [activeIsFootball, activeMarket]);
  const selectedOutcome = displayOutcomes.find((outcome) => outcome.name === tradeOutcome) ?? displayOutcomes[0] ?? activeMarket.outcomes[0];
  const executionPrice = orderType === "limit" ? Number(limitPrice || selectedOutcome.price) : selectedOutcome.price;
  const estimatedShares = Number(amount || 0) / Math.max(0.01, executionPrice / 100);
  const maxSlippageCost = (Number(amount || 0) * Number(slippage || 0)) / 100;
  const heroCategory = activeCategory === "All" ? activeMarket.category : activeCategory;
  const heroImage = categoryImages[heroCategory] ?? categoryImages.All;
  const contextLocation = inferWeatherLocation(activeMarket, tradeOutcome);

  useEffect(() => {
    setEvidenceUrl(activeMarket.sourceUrl || "https://predicto-arena.vercel.app/api/markets");
    setEvidenceNote(`Evidence submitted for ${activeMarket.title}.`);
    setDisputeNote(`Please reconsider ${activeMarket.title} using the submitted evidence and dispute context.`);
    setOracleStatus("");
  }, [activeMarket.id, activeMarket.sourceUrl, activeMarket.title]);

  useEffect(() => {
    refreshActiveOnchainMarket(activeMarket).catch(() => null);
  }, [activeMarket.id, walletAddress, contractAddress]);

  useEffect(() => {
    if (!walletAddress) {
      setPositions([]);
      return;
    }
    refreshOnchainPortfolio(walletAddress).catch(() => null);
  }, [walletAddress, marketData, contractAddress]);

  useEffect(() => {
    let cancelled = false;
    async function loadWeather() {
      setWeatherStatus("loading");
      try {
        const response = await fetch(`/api/weather?location=${encodeURIComponent(contextLocation)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Weather API failed");
        const payload = await response.json();
        if (!cancelled) {
          setWeather(payload);
          setWeatherStatus("live");
        }
      } catch {
        if (!cancelled) {
          setWeather(null);
          setWeatherStatus("error");
        }
      }
    }
    loadWeather();
    return () => {
      cancelled = true;
    };
  }, [contextLocation]);

  useEffect(() => {
    if (!activeIsFootball) return;
    let cancelled = false;

    async function loadWorldCupFeed() {
      setWorldCupFeedStatus("loading");
      try {
        const response = await fetch("/api/world-cup-feed", { cache: "no-store" });
        if (!response.ok) throw new Error("World Cup feed unavailable");
        const payload = await response.json();
        if (!cancelled) {
          setWorldCupFeed(Array.isArray(payload.items) ? payload.items : []);
          setWorldCupFeedStatus(payload.source === "live" ? "live" : "fallback");
        }
      } catch {
        if (!cancelled) {
          setWorldCupFeed([
            { type: "fixture", headline: "World Cup 2026 ticker is refreshing live sports sources.", status: "Refreshing", source: "Predicto Arena" },
            { type: "news", headline: "GenLayer oracle review can settle markets from official FIFA public result evidence.", status: "Oracle", source: "GenLayer StudioNet" }
          ]);
          setWorldCupFeedStatus("fallback");
        }
      }
    }

    loadWorldCupFeed();
    const timer = window.setInterval(loadWorldCupFeed, 120000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeIsFootball]);

  function selectMarket(market: Market) {
    setActiveMarketId(market.id);
    setTradeOutcome(market.outcomes[0].name);
    setDrawerTab("Trade");
    setFeed((items) => [`Opened ${market.title}`, ...items].slice(0, 6));
  }

  function selectCategory(category: string) {
    setActiveCategory(category);
    const nextMarket = marketData.find((market) => category === "All" || market.category === category || market.tag === category);
    if (nextMarket) {
      setActiveMarketId(nextMarket.id);
      setTradeOutcome(nextMarket.outcomes[0]?.name ?? "");
      setDrawerTab("Trade");
      setFeed((items) => [`Opened ${category} market board`, ...items].slice(0, 6));
    }
  }

  function openMarketView(view: "Markets" | "Outcomes" | "Volume") {
    setMarketView(view);
    setFeed((items) => [`Switched market board to ${view}`, ...items].slice(0, 6));
  }

  function openTradeTicket() {
    setActiveNav("Markets");
    setDrawerTab("Trade");
    setTradeStatus("Trade ticket ready. Choose side, size, and submit a GenLayer wallet transaction.");
    setFeed((items) => [`Trade ticket opened for ${activeMarket.title}`, ...items].slice(0, 6));
  }

  function selectDrawerTab(tab: string) {
    setDrawerTab(tab);
    setFeed((items) => [`Opened ${tab} panel for ${activeMarket.title}`, ...items].slice(0, 6));
  }

  function selectOrderType(type: "market" | "limit") {
    setOrderType(type);
    setFeed((items) => [`${type === "market" ? "Market" : "Limit"} order selected`, ...items].slice(0, 6));
  }

  function selectTradeSide(side: "buy" | "sell") {
    setTradeSide(side);
    setTradeStatus(side === "sell" ? "Sell requires an existing position in this outcome." : "Buy will create/mirror this market on GenLayer if needed.");
    setFeed((items) => [`${side === "buy" ? "Buy" : "Sell"} side selected`, ...items].slice(0, 6));
  }

  function setQuickAmount(value: string) {
    setAmount(value);
    setTradeStatus(`Order size set to ${value} GEN.`);
  }

  async function submitTrade() {
    if (tradeBusy) return;
    const amountNumber = Number(amount || 0);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setTradeStatus("Enter a positive GEN amount before submitting.");
      setTxSteps(["Amount required", "Set order size", "Submit again"]);
      return;
    }
    if (tradeSide === "sell") {
      const hasPosition = positions.some((position) => position.marketTitle === activeMarket.title && position.outcome === tradeOutcome && position.side === "buy");
      if (!hasPosition) {
        setTradeStatus("No on-chain buy position found for this outcome. Buy shares first, then sell.");
        setTxSteps(["Sell blocked", "No matching on-chain position", "Buy this outcome first"]);
        return;
      }
    }
    if (orderType === "limit") {
      const limit = Number(limitPrice || 0);
      if (!Number.isFinite(limit) || limit <= 0 || limit >= 100) {
        setTradeStatus("Limit price must be between 1c and 99c.");
        setTxSteps(["Limit invalid", "Set a 1c-99c price", "Submit again"]);
        return;
      }
      if (tradeSide === "buy" && selectedOutcome.price > limit) {
        setTradeStatus(`Limit not met: current ${selectedOutcome.price}c is above your ${limit}c buy limit.`);
        setTxSteps(["Limit checked", "Price too high", "Order not submitted"]);
        return;
      }
      if (tradeSide === "sell" && selectedOutcome.price < limit) {
        setTradeStatus(`Limit not met: current ${selectedOutcome.price}c is below your ${limit}c sell limit.`);
        setTxSteps(["Limit checked", "Price too low", "Order not submitted"]);
        return;
      }
    }
    setTradeBusy(true);
    setTradeStatus("Submitting GenLayer transaction...");
    setTxSteps(["Wallet requested", "Checking GenLayer Snap", "Signing GenLayer order"]);
    try {
      if (!walletAddress) {
        await connectWallet();
      }
      const account = walletAddress || (await requestPrimaryAccount());
      await ensureStudioNet();
      await ensureGenLayerSnap();
      const outcomeIndex = Math.max(1, displayOutcomes.findIndex((outcome) => outcome.name === tradeOutcome) + 1);
      const amountCents = Math.max(1, Math.round(amountNumber * 100));
      const { client, txHash } = await submitGenLayerTrade(account, activeMarket, outcomeIndex, amountCents, amountNumber);
      setTxSteps(["Wallet confirmed", "GenLayer transaction sent", shortHash(txHash)]);
      await waitForFinalized(client, txHash);
      setTxSteps(["Wallet confirmed", "GenLayer transaction sent", `Finalized ${shortHash(txHash)}`]);
      await refreshActiveOnchainMarket(activeMarket, account);
      await refreshOnchainPortfolio(account);
      updateMission("trade-3", 1);
      updateMission("liquidity-100", Number(amount || 0));
      await refreshWalletState(account);
      setTradeStatus(`GenLayer tx finalized ${shortHash(txHash)}`);
      setFeed((items) => [`${tradeSide.toUpperCase()} ${tradeOutcome} with ${amount || "0"} GEN on StudioNet`, ...items].slice(0, 6));
    } catch (error) {
      const message = extractErrorMessage(error);
      setTxSteps(["Wallet/transaction error", message, isSnapError(message) ? "Use MetaMask with GenLayer Snap" : "Adjust amount or network"]);
      setTradeStatus(message);
      setFeed((items) => [`Trade error: ${message}`, ...items].slice(0, 6));
    } finally {
      setTradeBusy(false);
    }
  }

  async function submitMarket() {
    setCreatingMarket(true);
    try {
      const response = await fetch("/api/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createMarket)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Market API failed");
      const nextMarket = result.market as Market;
      let onchainNote = "";
      try {
        const account = walletAddress || (await requestPrimaryAccount());
        await ensureStudioNet();
        await ensureGenLayerSnap();
        const { client, txHash } = await submitGenLayerCreateMarket(account, nextMarket);
        await waitForFinalized(client, txHash);
        onchainNote = ` and mirrored on GenLayer ${shortHash(txHash)}`;
        await refreshWalletState(account);
        await refreshActiveOnchainMarket(nextMarket, account);
        await refreshOnchainPortfolio(account);
      } catch (chainError) {
        onchainNote = `, API saved; GenLayer mirror pending (${extractErrorMessage(chainError)})`;
      }
      setMarketData((items) => [nextMarket, ...items]);
      setActiveMarketId(nextMarket.id);
      setTradeOutcome(nextMarket.outcomes[0]?.name ?? "");
      setActiveNav("Markets");
      setDrawerTab("Rules");
      updateMission("create-market", 1);
      setFeed((items) => [`Created market${onchainNote}: ${nextMarket.title}`, ...items].slice(0, 6));
    } catch (error) {
      const message = extractErrorMessage(error);
      setFeed((items) => [`Create market error: ${message}`, ...items].slice(0, 6));
    } finally {
      setCreatingMarket(false);
    }
  }

  async function askAi() {
    setAiLoading(true);
    setAiAnswer("");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: aiQuestion, market: activeMarket, markets: marketData })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "AI request failed");
      setAiAnswer(result.answer);
      updateMission("oracle-review", 1);
      setFeed((items) => [`AI analyzed ${activeMarket.title}`, ...items].slice(0, 6));
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request failed";
      setAiAnswer(message);
      setFeed((items) => [`AI error: ${message}`, ...items].slice(0, 6));
    } finally {
      setAiLoading(false);
    }
  }

  function updateMission(id: string, delta: number) {
    setMissions((items) =>
      items.map((mission) =>
        mission.id === id ? { ...mission, progress: Math.min(mission.target, mission.progress + delta) } : mission
      )
    );
  }

  function claimMission(id: string) {
    setMissions((items) =>
      items.map((mission) => {
        if (mission.id !== id || mission.claimed || mission.progress < mission.target) return mission;
        setTickets((current) => current + mission.reward);
        setFeed((feedItems) => [`Claimed ${mission.reward} tickets: ${mission.title}`, ...feedItems].slice(0, 6));
        return { ...mission, claimed: true };
      })
    );
  }

  async function addLiquidity() {
    if (liquidityBusy) return;
    const value = Number(liquidityAmount || 0);
    if (!Number.isFinite(value) || value <= 0) {
      setFeed((items) => ["Liquidity amount must be positive", ...items].slice(0, 6));
      return;
    }
    setLiquidityBusy(true);
    try {
      if (!walletAddress) {
        await connectWallet();
      }
      const account = walletAddress || (await requestPrimaryAccount());
      await ensureStudioNet();
      await ensureGenLayerSnap();
      const amountCents = Math.max(1, Math.round(value * 100));
      const { client, txHash } = await submitGenLayerLiquidity(account, activeMarket, amountCents, value);
      await waitForFinalized(client, txHash);
      await refreshActiveOnchainMarket(activeMarket, account);
      await refreshOnchainPortfolio(account);
      updateMission("liquidity-100", value);
      await refreshWalletState(account);
      setFeed((items) => [`Added ${value.toFixed(2)} GEN liquidity on GenLayer ${shortHash(txHash)}`, ...items].slice(0, 6));
    } catch (error) {
      const message = extractErrorMessage(error);
      setFeed((items) => [`Liquidity error: ${message}`, ...items].slice(0, 6));
    } finally {
      setLiquidityBusy(false);
    }
  }

  async function submitEvidence() {
    if (oracleBusy) return;
    if (evidenceUrl.trim().length < 8 || evidenceNote.trim().length < 10) {
      setOracleStatus("Evidence needs a valid URL and a note with enough detail.");
      return;
    }
    setOracleBusy(true);
    setOracleStatus("Submitting evidence to GenLayer...");
    try {
      if (!walletAddress) {
        await connectWallet();
      }
      const account = walletAddress || (await requestPrimaryAccount());
      await ensureStudioNet();
      await ensureGenLayerSnap();
      const { client, txHash } = await submitGenLayerEvidence(account, activeMarket, evidenceUrl.trim(), evidenceNote.trim());
      await waitForFinalized(client, txHash);
      await refreshActiveOnchainMarket(activeMarket, account);
      await refreshWalletState(account);
      updateMission("oracle-review", 1);
      setOracleStatus(`Evidence finalized on GenLayer ${shortHash(txHash)}`);
      setFeed((items) => [`Evidence submitted for ${activeMarket.title} ${shortHash(txHash)}`, ...items].slice(0, 6));
    } catch (error) {
      const message = extractErrorMessage(error);
      setOracleStatus(message);
      setFeed((items) => [`Evidence error: ${message}`, ...items].slice(0, 6));
    } finally {
      setOracleBusy(false);
    }
  }

  async function submitDispute() {
    if (oracleBusy) return;
    if (disputeNote.trim().length < 20) {
      setOracleStatus("Dispute note must explain why the current resolution should change.");
      return;
    }
    setOracleBusy(true);
    setOracleStatus("Opening dispute on GenLayer...");
    try {
      if (!walletAddress) {
        await connectWallet();
      }
      const account = walletAddress || (await requestPrimaryAccount());
      await ensureStudioNet();
      await ensureGenLayerSnap();
      const { client, txHash } = await submitGenLayerDispute(account, activeMarket, disputeNote.trim());
      await waitForFinalized(client, txHash);
      await refreshActiveOnchainMarket(activeMarket, account);
      await refreshWalletState(account);
      setOracleStatus(`Dispute finalized on GenLayer ${shortHash(txHash)}`);
      setFeed((items) => [`Dispute opened for ${activeMarket.title} ${shortHash(txHash)}`, ...items].slice(0, 6));
    } catch (error) {
      const message = extractErrorMessage(error);
      setOracleStatus(message);
      setFeed((items) => [`Dispute error: ${message}`, ...items].slice(0, 6));
    } finally {
      setOracleBusy(false);
    }
  }

  async function resolveMarketOnchain() {
    if (oracleBusy) return;
    setOracleBusy(true);
    setOracleStatus("Resolving market with submitted evidence and disputes...");
    try {
      if (!walletAddress) {
        await connectWallet();
      }
      const account = walletAddress || (await requestPrimaryAccount());
      await ensureStudioNet();
      await ensureGenLayerSnap();
      const { client, txHash } = await submitGenLayerResolve(account, activeMarket);
      await waitForFinalized(client, txHash);
      await refreshActiveOnchainMarket(activeMarket, account);
      await refreshOnchainPortfolio(account);
      await refreshWalletState(account);
      setOracleStatus(`Resolution finalized on GenLayer ${shortHash(txHash)}`);
      setFeed((items) => [`Resolved ${activeMarket.title} via GenLayer ${shortHash(txHash)}`, ...items].slice(0, 6));
    } catch (error) {
      const message = extractErrorMessage(error);
      setOracleStatus(message);
      setFeed((items) => [`Resolve error: ${message}`, ...items].slice(0, 6));
    } finally {
      setOracleBusy(false);
    }
  }

  async function claimMarketWinnings() {
    if (claimBusy) return;
    setClaimBusy(true);
    setTradeStatus("Claiming on-chain winnings...");
    try {
      if (!walletAddress) {
        await connectWallet();
      }
      const account = walletAddress || (await requestPrimaryAccount());
      await ensureStudioNet();
      await ensureGenLayerSnap();
      const outcomeIndex = Math.max(1, displayOutcomes.findIndex((outcome) => outcome.name === tradeOutcome) + 1);
      const { client, txHash } = await submitGenLayerClaim(account, activeMarket, outcomeIndex);
      await waitForFinalized(client, txHash);
      await refreshActiveOnchainMarket(activeMarket, account);
      await refreshOnchainPortfolio(account);
      await refreshWalletState(account);
      setTradeStatus(`Claim finalized on GenLayer ${shortHash(txHash)}`);
      setFeed((items) => [`Claimed winnings for ${tradeOutcome} ${shortHash(txHash)}`, ...items].slice(0, 6));
    } catch (error) {
      const message = extractErrorMessage(error);
      setTradeStatus(message);
      setFeed((items) => [`Claim error: ${message}`, ...items].slice(0, 6));
    } finally {
      setClaimBusy(false);
    }
  }

  function getWalletProvider(kind: WalletKind = selectedWallet): EthereumProvider | undefined {
    const injected = window.ethereum;
    const providers = injected?.providers ?? [];
    if (kind === "okx") return window.okxwallet ?? providers.find((provider: any) => provider?.isOkxWallet) ?? injected;
    if (kind === "rabby") return window.rabby ?? providers.find((provider: any) => provider?.isRabby) ?? injected;
    return providers.find((provider: any) => provider?.isMetaMask && !provider?.isRabby && !provider?.isOkxWallet) ?? injected;
  }

  function walletLabel(kind: WalletKind = selectedWallet) {
    return walletOptions.find((wallet) => wallet.id === kind)?.label ?? "Wallet";
  }

  async function connectWallet(kind: WalletKind = selectedWallet) {
    setSelectedWallet(kind);
    setWalletName(walletLabel(kind));
    setWalletError("");
    const provider = getWalletProvider(kind);
    if (!provider) {
      const message = `${walletLabel(kind)} wallet not found`;
      setWalletError(message);
      setFeed((items) => [`Install or unlock ${walletLabel(kind)} to connect`, ...items].slice(0, 6));
      return;
    }

    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const firstAccount = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : "";
      if (!firstAccount) throw new Error("No wallet account returned");
      setWalletAddress(firstAccount);
      await ensureStudioNet(provider);
      if (kind === "metamask") {
        checkGenLayerSnap(provider).catch(() => null);
      } else {
        setWalletSnapReady(false);
      }
      await refreshWalletState(firstAccount, provider);
      setFeed((items) => [`${walletLabel(kind)} connected ${shortAddress(firstAccount)}`, ...items].slice(0, 6));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet connection rejected";
      setWalletError(message);
      setFeed((items) => [`Wallet error: ${message}`, ...items].slice(0, 6));
    }
  }

  async function requestPrimaryAccount() {
    const provider = getWalletProvider();
    const accounts = await provider?.request({ method: "eth_requestAccounts" });
    const account = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : "";
    if (!account) throw new Error("Connect wallet first");
    setWalletAddress(account);
    return account;
  }

  async function ensureStudioNet(provider: EthereumProvider | undefined = getWalletProvider()) {
    if (!provider) throw new Error("Wallet not found");
    const currentChainId = await provider.request({ method: "eth_chainId" });
    if (currentChainId === STUDIO_CHAIN_ID) {
      setWalletChain("GenLayer StudioNet");
      return;
    }

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: STUDIO_CHAIN_ID }]
      });
    } catch (error: any) {
      if (error?.code !== 4902) throw error;
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: STUDIO_CHAIN_ID,
            chainName: "GenLayer Studio Network",
            rpcUrls: [STUDIO_RPC_URL],
            nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 },
            blockExplorerUrls: ["https://genlayer-explorer.vercel.app"]
          }
        ]
      });
    }
    setWalletChain("GenLayer StudioNet");
  }

  async function checkGenLayerSnap(provider: EthereumProvider | undefined = getWalletProvider("metamask")) {
    if (!provider) throw new Error("MetaMask not found");
    try {
      const snaps = await provider.request({ method: "wallet_getSnaps" });
      const installed = Object.values((snaps ?? {}) as Record<string, any>).some((snap: any) => snap?.id === GENLAYER_SNAP_ID);
      setWalletSnapReady(installed);
      return installed;
    } catch {
      setWalletSnapReady(false);
      throw new Error("MetaMask Snaps are required for GenLayer transaction signing. Rabby and OKX can connect for EVM account context, but GenLayer writes require MetaMask with the GenLayer Snap.");
    }
  }

  async function ensureGenLayerSnap() {
    if (selectedWallet !== "metamask") {
      setWalletSnapReady(false);
      throw new Error(`${walletLabel(selectedWallet)} is connected for account context. GenLayer write transactions require MetaMask with the GenLayer Snap.`);
    }
    const provider = getWalletProvider("metamask");
    if (!provider) throw new Error("MetaMask not found");
    const installed = await checkGenLayerSnap(provider);
    if (installed) return;
    try {
      await provider.request({
        method: "wallet_requestSnaps",
        params: {
          [GENLAYER_SNAP_ID]: {}
        }
      });
      setWalletSnapReady(true);
    } catch (error) {
      setWalletSnapReady(false);
      throw new Error(`GenLayer Snap is required to sign this StudioNet transaction. Open ${GENLAYER_STUDIO_URL} with MetaMask and install/approve the GenLayer Snap. ${extractErrorMessage(error)}`);
    }
  }

  async function refreshWalletState(account: string, provider: EthereumProvider | undefined = getWalletProvider()) {
    if (!provider) return;
    const [balanceHex, chainId] = await Promise.all([
      provider.request({ method: "eth_getBalance", params: [account, "latest"] }),
      provider.request({ method: "eth_chainId" })
    ]);
    if (typeof balanceHex === "string") {
      setGenBalance(formatGEN(BigInt(balanceHex)));
    }
    setWalletChain(chainId === STUDIO_CHAIN_ID ? "GenLayer StudioNet" : String(chainId));
  }

  function currentContractAddress() {
    return (contractAddress || CONTRACT_ADDRESS) as `0x${string}`;
  }

  async function createStudionetClient(account: string) {
    const client = createClient({ chain: studionet, account: account as `0x${string}` });
    await client.connect("studionet");
    return client;
  }

  async function waitForFinalized(client: any, txHash: string) {
    await client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.FINALIZED,
      retries: 220
    });
  }

  function parseContractInt(value: unknown) {
    if (typeof value === "bigint") return Number(value);
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  function parseContractText(value: unknown) {
    return typeof value === "string" ? value : value == null ? "" : String(value);
  }

  async function readOnchainMarket(market: Market, account?: string): Promise<OnchainMarketSnapshot> {
    const externalId = String(market.id);
    const marketIdResult = await readClient.readContract({
      address: currentContractAddress(),
      functionName: "get_market_id_by_external_id",
      args: [externalId]
    });
    const onchainMarketId = parseContractInt(marketIdResult);
    if (!onchainMarketId) {
      return {
        marketId: null,
        exists: false,
        status: "NOT_CREATED",
        liquidityCents: 0,
        volumeCents: 0,
        balanceGEN: "0.0000",
        evidenceCount: 0,
        disputeCount: 0,
        resolvedOutcome: 0,
        resolutionNote: "This market has not been mirrored on-chain yet.",
        pricesByOutcome: {},
        poolsByOutcome: {},
        userPositionsByOutcome: {},
        liquidityPositionCents: 0
      };
    }

    const marketResult = await readClient.readContract({
      address: currentContractAddress(),
      functionName: "get_market",
      args: [onchainMarketId]
    }) as Record<string, unknown>;

    const outcomes = isFootballMarket(market) ? buildWorldCupOutcomes(market) : market.outcomes;
    const outcomeReads = await Promise.all(
      outcomes.map(async (outcome, index) => {
        const outcomeResult = await readClient.readContract({
          address: currentContractAddress(),
          functionName: "get_outcome",
          args: [onchainMarketId, index + 1]
        }) as Record<string, unknown>;

        let userPosition = 0;
        if (account) {
          const positionResult = await readClient.readContract({
            address: currentContractAddress(),
            functionName: "get_position",
            args: [onchainMarketId, index + 1, account]
          });
          userPosition = parseContractInt(positionResult);
        }

        return {
          outcome: outcome.name,
          priceCents: parseContractInt(outcomeResult.price_cents),
          poolCents: parseContractInt(outcomeResult.pool_cents),
          userPositionCents: userPosition
        };
      })
    );

    const liquidityResult = account
      ? await readClient.readContract({
          address: currentContractAddress(),
          functionName: "get_liquidity_position",
          args: [onchainMarketId, account]
        })
      : 0;

    const pricesByOutcome = Object.fromEntries(outcomeReads.map((item) => [item.outcome, item.priceCents]));
    const poolsByOutcome = Object.fromEntries(outcomeReads.map((item) => [item.outcome, item.poolCents]));
    const userPositionsByOutcome = Object.fromEntries(outcomeReads.map((item) => [item.outcome, item.userPositionCents]));

    return {
      marketId: onchainMarketId,
      exists: true,
      status: parseContractText(marketResult.status),
      liquidityCents: parseContractInt(marketResult.liquidity_cents),
      volumeCents: parseContractInt(marketResult.volume_cents),
      balanceGEN: formatGEN(BigInt(parseContractText(marketResult.contract_balance_wei) || "0")),
      evidenceCount: parseContractInt(marketResult.evidence_count),
      disputeCount: parseContractInt(marketResult.dispute_count),
      resolvedOutcome: parseContractInt(marketResult.resolved_outcome),
      resolutionNote: parseContractText(marketResult.resolution_note),
      pricesByOutcome,
      poolsByOutcome,
      userPositionsByOutcome,
      liquidityPositionCents: parseContractInt(liquidityResult)
    };
  }

  async function refreshActiveOnchainMarket(nextMarket: Market = activeMarket, account = walletAddress) {
    try {
      const snapshot = await readOnchainMarket(nextMarket, account || undefined);
      setActiveOnchainMarket(snapshot);
      setOnchainStatus(snapshot.exists ? `On-chain market ${snapshot.status}` : "On-chain market not created yet");
      return snapshot;
    } catch (error) {
      const message = extractErrorMessage(error);
      setOnchainStatus(`On-chain read error: ${message}`);
      return null;
    }
  }

  async function refreshOnchainPortfolio(account = walletAddress) {
    if (!account) {
      setPositions([]);
      return;
    }
    setPortfolioBusy(true);
    try {
      const nextPositions: Position[] = [];
      for (const market of marketData) {
        const snapshot = await readOnchainMarket(market, account);
        if (!snapshot.exists || !snapshot.marketId) continue;
        const outcomes = isFootballMarket(market) ? buildWorldCupOutcomes(market) : market.outcomes;
        for (const outcome of outcomes) {
          const userPositionCents = snapshot.userPositionsByOutcome[outcome.name] ?? 0;
          if (userPositionCents > 0) {
            nextPositions.push({
              id: `onchain-${snapshot.marketId}-${outcome.name}`,
              marketTitle: market.title,
              outcome: outcome.name,
              side: "buy",
              amount: userPositionCents / 100,
              price: snapshot.pricesByOutcome[outcome.name] ?? outcome.price,
              shares: userPositionCents / 100,
              createdAt: "On-chain"
            });
          }
        }
        const liquidityCents = snapshot.liquidityPositionCents;
        if (liquidityCents > 0) {
          nextPositions.push({
            id: `onchain-liquidity-${snapshot.marketId}`,
            marketTitle: market.title,
            outcome: "Liquidity",
            side: "liquidity",
            amount: liquidityCents / 100,
            price: 100,
            shares: liquidityCents / 100,
            createdAt: "On-chain"
          });
        }
      }
      setPositions(nextPositions);
    } finally {
      setPortfolioBusy(false);
    }
  }

  function contractMarketArgs(market: Market) {
    const rules = market.note.length >= 30 ? market.note : `${market.title}. Resolve using public evidence and the listed source data.`;
    const outcomes = isFootballMarket(market) ? buildWorldCupOutcomes(market) : market.outcomes;
    return [
      String(market.id),
      market.title,
      market.category,
      rules,
      market.sourceUrl || "https://predicto-arena.vercel.app/api/markets",
      outcomes.map((outcome) => outcome.name.replaceAll(",", " ")).join(",")
    ];
  }

  async function submitGenLayerTrade(account: string, market: Market, outcomeIndex: number, amountCents: number, amountGen: number) {
    const client = await createStudionetClient(account);
    const baseArgs = contractMarketArgs(market);
    if (tradeSide === "sell") {
      const txHash = await client.writeContract({
        address: currentContractAddress(),
        functionName: "sell_position_by_external_id",
        args: [String(market.id), outcomeIndex, amountCents],
        value: BigInt(0)
      });
      return { client, txHash };
    }
    const txHash = await client.writeContract({
      address: currentContractAddress(),
      functionName: "ensure_market_and_buy",
      args: [...baseArgs, outcomeIndex, amountCents],
      value: parseGEN(amountGen)
    });
    return { client, txHash };
  }

  async function submitGenLayerLiquidity(account: string, market: Market, amountCents: number, amountGen: number) {
    const client = await createStudionetClient(account);
    const txHash = await client.writeContract({
      address: currentContractAddress(),
      functionName: "ensure_market_and_add_liquidity",
      args: [...contractMarketArgs(market), amountCents],
      value: parseGEN(amountGen)
    });
    return { client, txHash };
  }

  async function submitGenLayerCreateMarket(account: string, market: Market) {
    const client = await createStudionetClient(account);
    const txHash = await client.writeContract({
      address: currentContractAddress(),
      functionName: "create_market_with_external_id",
      args: contractMarketArgs(market),
      value: BigInt(0)
    });
    return { client, txHash };
  }

  async function submitGenLayerEvidence(account: string, market: Market, url: string, note: string) {
    const client = await createStudionetClient(account);
    const txHash = await client.writeContract({
      address: currentContractAddress(),
      functionName: "add_evidence",
      args: [market.id, url, note],
      value: BigInt(0)
    });
    return { client, txHash };
  }

  async function submitGenLayerDispute(account: string, market: Market, note: string) {
    const client = await createStudionetClient(account);
    const txHash = await client.writeContract({
      address: currentContractAddress(),
      functionName: "open_dispute",
      args: [market.id, note],
      value: BigInt(0)
    });
    return { client, txHash };
  }

  async function submitGenLayerResolve(account: string, market: Market) {
    const client = await createStudionetClient(account);
    const txHash = await client.writeContract({
      address: currentContractAddress(),
      functionName: "resolve_market",
      args: [market.id],
      value: BigInt(0)
    });
    return { client, txHash };
  }

  async function submitGenLayerClaim(account: string, market: Market, outcomeIndex: number) {
    const client = await createStudionetClient(account);
    const txHash = await client.writeContract({
      address: currentContractAddress(),
      functionName: "claim_winnings",
      args: [market.id, outcomeIndex],
      value: BigInt(0)
    });
    return { client, txHash };
  }

  return (
    <main className="terminal">
      <header className="topbar">
        <div className="brand-lockup" aria-label="Predicto Arena">
          <div className="logo-mark"><span /></div>
          <strong>Predicto</strong>
        </div>
        <nav className="main-nav">
          {navItems.map((item) => {
            const Icon = navIcons[item as keyof typeof navIcons];
            return (
              <button key={item} className={activeNav === item ? "active" : ""} onClick={() => setActiveNav(item)}>
                <Icon size={16} />{item}
              </button>
            );
          })}
        </nav>
        <label className="search">
          <Search size={14} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search markets..." />
        </label>
        <div className="wallet-select">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              className={selectedWallet === wallet.id ? "active" : ""}
              onClick={() => connectWallet(wallet.id)}
              type="button"
            >
              {wallet.label}
            </button>
          ))}
        </div>
        <button className="deposit pulse-action" onClick={() => connectWallet(selectedWallet)}>
          <Wallet size={16} />{walletAddress ? `${walletName} connected` : "Connect"}
        </button>
        <div className="wallet-pill">{genBalance} GEN</div>
        <div className="wallet-pill">{walletChain || "StudioNet"}</div>
        <button className={walletError ? "wallet-address wallet-alert" : "wallet-address"} onClick={() => connectWallet(selectedWallet)}>
          {walletAddress ? shortAddress(walletAddress) : walletError || (dataStatus === "loading" ? "Loading API" : dataStatus === "live" ? "API Live" : "Seed data")}
        </button>
      </header>

      <section className="category-strip">
        {categories.map((category) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          return (
            <button key={category} className={activeCategory === category ? "selected" : ""} onClick={() => selectCategory(category)}>
              <Icon size={15} />{category}
            </button>
          );
        })}
        <button className="new-market" onClick={() => setActiveNav("Create")}><Plus size={15} />Create market</button>
      </section>

      {activeNav === "Markets" && (
        <section className="market-shell">
          <section className="left-stage">
            <div className="category-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(14,6,18,.96), rgba(14,6,18,.58)), url(${heroImage})` }}>
              <span><Zap size={15} /> {heroCategory} live market</span>
              <strong>{heroCategory === "World Cup" ? "Football markets with real match-themed visuals" : "GenLayer studionet oracle-ready markets"}</strong>
              <button onClick={() => setActiveNav("Create")}>List a market <ChevronRight size={15} /></button>
            </div>
            <div className="feature-market">
              <div className="feature-head">
                <div>
                  <span className="micro">Featured market</span>
                  <h1>{activeMarket.title}</h1>
                  <p>{activeMarket.note}</p>
                </div>
                <button onClick={openTradeTicket}><Activity size={16} />Trade now</button>
              </div>
              <div className={activeIsFootball ? "feature-grid football-grid" : "feature-grid"}>
                {activeIsFootball ? (
                  <WorldCupOutcomeTicker outcomes={displayOutcomes} selected={tradeOutcome} onSelect={setTradeOutcome} />
                ) : (
                  <div className="outcome-stack">
                    {displayOutcomes.map((outcome) => (
                      <button
                        key={outcome.name}
                        className={tradeOutcome === outcome.name ? "outcome selected" : "outcome"}
                        onClick={() => setTradeOutcome(outcome.name)}
                      >
                        <span>{outcome.name}</span>
                        <strong>{outcome.price}c</strong>
                        <em className={outcome.side}>{outcome.change}</em>
                      </button>
                    ))}
                  </div>
                )}
                {activeIsFootball ? (
                  <FootballEventBoard market={activeMarket} selectedOutcome={tradeOutcome} feed={worldCupFeed} feedStatus={worldCupFeedStatus} />
                ) : isCryptoMarket(activeMarket) ? (
                  <div className="chart-panel tradingview-panel">
                    <TradingViewChart market={activeMarket} />
                    <div className="chart-meta">
                      <span>Vol {activeMarket.volume}</span>
                      <span>Liq {activeMarket.liquidity}</span>
                      <span>Close {activeMarket.closes}</span>
                      <span>{activeMarket.source ?? "Predicto"}</span>
                    </div>
                  </div>
                ) : (
                  <CategoryEventBoard market={activeMarket} selectedOutcome={tradeOutcome} />
                )}
              </div>
            </div>

            <div className="section-title">
              <h2>{activeCategory === "All" ? "Trending markets" : `${activeCategory} markets`}</h2>
              <div className="view-tabs">
                {(["Markets", "Outcomes", "Volume"] as const).map((view) => (
                  <button key={view} className={marketView === view ? "active" : ""} onClick={() => openMarketView(view)}>
                    {view === "Markets" && <ChartCandlestick size={15} />}
                    {view === "Outcomes" && <Gauge size={15} />}
                    {view === "Volume" && <BarChart3 size={15} />}
                    {view}
                  </button>
                ))}
              </div>
            </div>

            <MarketBoard view={marketView} markets={filteredMarkets} activeMarketId={activeMarket.id} onSelectMarket={selectMarket} />
          </section>

          <aside className="right-dock">
            <div className="trade-drawer">
              <div className="drawer-tabs">
                {["Trade", "Book", "Rules", "Oracle"].map((tab) => (
                  <button key={tab} className={drawerTab === tab ? "active" : ""} onClick={() => selectDrawerTab(tab)}>{tab}</button>
                ))}
              </div>
              {drawerTab === "Trade" && (
                <div className="ticket">
                  <h2>{selectedOutcome.name}</h2>
                  <p>{activeMarket.title}</p>
                  <div className="order-mode">
                    <button className={orderType === "market" ? "active" : ""} onClick={() => selectOrderType("market")}>Market</button>
                    <button className={orderType === "limit" ? "active" : ""} onClick={() => selectOrderType("limit")}>Limit</button>
                  </div>
                  <div className="side-toggle">
                    <button className={tradeSide === "buy" ? "active" : ""} onClick={() => selectTradeSide("buy")}>Buy</button>
                    <button className={tradeSide === "sell" ? "active" : ""} onClick={() => selectTradeSide("sell")}>Sell</button>
                  </div>
                  <label>Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
                  <div className="quick-row">
                    {["10", "25", "50", "100"].map((value) => (
                      <button key={value} className={amount === value ? "active" : ""} onClick={() => setQuickAmount(value)}>{value} GEN</button>
                    ))}
                  </div>
                  {orderType === "limit" && <label>Limit price<input value={limitPrice} onChange={(event) => setLimitPrice(event.target.value)} /></label>}
                  <label>Max slippage<input value={slippage} onChange={(event) => setSlippage(event.target.value)} /></label>
                  <div className="quote-box">
                    <span>Execution</span><strong>{executionPrice}c</strong>
                    <span>Est. shares</span><strong>{estimatedShares.toFixed(2)}</strong>
                    <span>Slippage cap</span><strong>{maxSlippageCost.toFixed(3)} GEN</strong>
                    <span>Max payout</span><strong>${(estimatedShares).toFixed(2)}</strong>
                  </div>
                  <button className="submit-trade pulse-action" onClick={submitTrade} disabled={tradeBusy}>
                    <ShoppingCart size={16} />{tradeBusy ? "Submitting..." : tradeSide === "buy" ? "Buy shares" : "Sell shares"}
                  </button>
                  <button className="settlement-action" onClick={claimMarketWinnings} disabled={claimBusy}>
                    <Coins size={16} />{claimBusy ? "Claiming..." : "Claim winnings"}
                  </button>
                  {walletSnapReady === false && (
                    <a className="snap-help" href={GENLAYER_STUDIO_URL} target="_blank" rel="noreferrer">
                      {selectedWallet === "metamask" ? "Open GenLayer Studio to enable the GenLayer Snap" : `${walletName} connected. Use MetaMask + GenLayer Snap to submit GenLayer writes.`}
                    </a>
                  )}
                  {tradeStatus && <span className="api-note">{tradeStatus}</span>}
                  <TxTimeline steps={txSteps} />
                </div>
              )}
              {drawerTab === "Book" && <OrderBook market={activeMarket} />}
              {drawerTab === "Rules" && <Rules market={activeMarket} onchain={activeOnchainMarket} status={onchainStatus} />}
              {drawerTab === "Oracle" && (
                <Oracle
                  market={activeMarket}
                  evidenceUrl={evidenceUrl}
                  evidenceNote={evidenceNote}
                  disputeNote={disputeNote}
                  busy={oracleBusy}
                  status={oracleStatus}
                  onEvidenceUrl={setEvidenceUrl}
                  onEvidenceNote={setEvidenceNote}
                  onDisputeNote={setDisputeNote}
                  onSubmitEvidence={submitEvidence}
                  onSubmitDispute={submitDispute}
                  onResolve={resolveMarketOnchain}
                />
              )}
            </div>
            <LiquidityPanel amount={liquidityAmount} busy={liquidityBusy} onAmount={setLiquidityAmount} onAdd={addLiquidity} market={activeMarket} />

            <div className="side-feed">
              <h2>New markets</h2>
              {marketData.slice(1, 6).map((market) => (
                <button key={market.id} onClick={() => selectMarket(market)}>
                  <strong>{market.title}</strong>
                  <span>{market.volume} / {market.tag}</span>
                </button>
              ))}
            </div>
            <AiPanel
              question={aiQuestion}
              answer={aiAnswer}
              loading={aiLoading}
              onQuestion={setAiQuestion}
              onAsk={askAi}
            />
            <GenLayerPanel contractAddress={contractAddress} network={network} dataSources={dataSources} onchain={activeOnchainMarket} status={onchainStatus} />
          </aside>
        </section>
      )}

      {activeNav === "Create" && (
        <CreateMarketView
          value={createMarket}
          busy={creatingMarket}
          onChange={setCreateMarket}
          onSubmit={submitMarket}
        />
      )}
      {activeNav === "Portfolio" && <Portfolio feed={feed} positions={positions} busy={portfolioBusy} />}
      {activeNav === "Leaderboard" && <Leaderboard walletAddress={walletAddress} positions={positions} tickets={tickets} />}
      {activeNav === "Earn Tickets" && <Tickets missions={missions} onClaim={claimMission} />}

      <footer className="status-bar">
        <span className="online-dot" /> Live session
        <WeatherTicker weather={weather} weatherStatus={weatherStatus} location={contextLocation} market={activeMarket} />
      </footer>
    </main>
  );
}

function tradingViewSymbol(market: Market) {
  const text = `${market.title} ${market.tag}`.toUpperCase();
  if (text.includes("ETHEREUM") || text.includes("ETH")) return "BINANCE:ETHUSDT";
  if (text.includes("BNB")) return "BINANCE:BNBUSDT";
  if (text.includes("SOLANA") || text.includes("SOL")) return "BINANCE:SOLUSDT";
  return "BINANCE:BTCUSDT";
}

function TradingViewChart({ market }: { market: Market }) {
  const symbol = tradingViewSymbol(market);
  const src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=1b1021&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1`;

  return (
    <iframe
      key={symbol}
      className="tradingview-frame"
      title={`TradingView chart ${symbol}`}
      src={src}
      allowFullScreen
    />
  );
}

function WorldCupOutcomeTicker({
  outcomes,
  selected,
  onSelect
}: {
  outcomes: Market["outcomes"];
  selected: string;
  onSelect: (outcome: string) => void;
}) {
  const repeated = [...outcomes, ...outcomes];
  return (
    <div className="worldcup-outcome-ticker">
      <div className="ticker-title">
        <span><Trophy size={14} />All World Cup teams</span>
        <strong>Hover to pause, click a team to trade</strong>
      </div>
      <div className="worldcup-outcome-rail">
        <div className="worldcup-outcome-track">
          {repeated.map((outcome, index) => (
            <button
              key={`${outcome.name}-${index}`}
              type="button"
              className={selected === outcome.name ? "team-odd selected" : "team-odd"}
              onClick={() => onSelect(outcome.name)}
            >
              <b><img src={flagForOutcome(outcome.name)} alt="" /></b>
              <span>{outcome.name}</span>
              <strong>{outcome.price}c</strong>
              <em className={outcome.side}>{outcome.change}</em>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FootballEventBoard({
  market,
  selectedOutcome,
  feed,
  feedStatus
}: {
  market: Market;
  selectedOutcome: string;
  feed: WorldCupFeedItem[];
  feedStatus: "loading" | "live" | "fallback";
}) {
  const headline = worldCupImages[market.id % worldCupImages.length];
  const eventCards = worldCupImages.map((event, index) => ({
    ...event,
    label: ["Winner market", "Player props", "Host edge", "Debutants", "Group math", "Final path"][index] ?? "Market"
  }));
  const confederationSummary = ["Host", "AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"].map((group) => ({
    group,
    count: worldCupTeams.filter((team) => team.group === group).length
  }));

  return (
    <div className="football-board">
      <div className="football-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(13,5,17,.9), rgba(13,5,17,.35)), url(${headline.image})` }}>
        <span><Trophy size={16} />FIFA World Cup 2026 market</span>
        <strong>{selectedOutcome} pressure watch</strong>
        <p>{headline.detail}</p>
      </div>

      <WorldCupNewsTicker items={feed} status={feedStatus} />

      <div className="football-events">
        {eventCards.map((event) => (
          <article key={event.title} style={{ backgroundImage: `linear-gradient(180deg, rgba(10,4,13,.2), rgba(10,4,13,.92)), url(${event.image})` }}>
            <span>{event.label}</span>
            <strong>{event.title}</strong>
            <p>{event.detail}</p>
          </article>
        ))}
      </div>

      <div className="football-media">
        <div>
          <span>Media pulse</span>
          <strong>World Cup 2026 video links</strong>
        </div>
        <div className="clip-grid">
          {worldCupClips.map((clip) => (
            <a key={clip.id} href={`https://www.youtube.com/watch?v=${clip.id}`} target="_blank" rel="noreferrer">
              <img src={`https://img.youtube.com/vi/${clip.id}/hqdefault.jpg`} alt="" />
              <div>
                <span>{clip.platform}</span>
                <strong>{clip.title}</strong>
                <em>Open video</em>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="qualified-teams">
        <div>
          <span>Verified participant board</span>
          <strong>World Cup 2026 teams ({worldCupTeams.length})</strong>
        </div>
        <div className="confed-summary">
          {confederationSummary.map((item) => (
            <span key={item.group}><strong>{item.count}</strong>{item.group}</span>
          ))}
        </div>
        <div className="team-strip">
          {worldCupTeams.map((team) => (
            <button key={team.name} type="button">
              <span><img src={flagUrl(team.code)} alt="" />{team.code}</span>
              <strong>{team.name}</strong>
              <em>{team.group}</em>
            </button>
          ))}
        </div>
        <p>{market.source ?? "FIFA public evidence"} tracks participating teams, fixtures, and official result sources for GenLayer resolution.</p>
      </div>
    </div>
  );
}

function WorldCupNewsTicker({ items, status }: { items: WorldCupFeedItem[]; status: "loading" | "live" | "fallback" }) {
  const feedItems: WorldCupFeedItem[] = items.length > 0 ? items : [
    { type: "fixture", headline: "Loading World Cup news and score ticker...", status: "Live feed", source: "Predicto Arena" }
  ];
  const repeated = [...feedItems, ...feedItems];

  return (
    <div className="wc-news-ticker">
      <div className="wc-news-head">
        <span><Activity size={14} />{status === "live" ? "Live sports API" : status === "loading" ? "Loading" : "Fallback oracle feed"}</span>
        <strong>World Cup electronic board</strong>
      </div>
      <div className="wc-news-rail">
        <div className="wc-news-track">
          {repeated.map((item, index) => {
            const content = (
              <>
                <b>{item.type === "score" ? "Score" : item.type === "fixture" ? "Fixture" : "News"}</b>
                <strong>{item.headline}</strong>
                <em>{item.status ?? item.source}</em>
              </>
            );
            return item.url ? (
              <a key={`${item.headline}-${index}`} className={`wc-news-item ${item.type}`} href={item.url} target="_blank" rel="noreferrer">{content}</a>
            ) : (
              <span key={`${item.headline}-${index}`} className={`wc-news-item ${item.type}`}>{content}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoryEventBoard({ market, selectedOutcome }: { market: Market; selectedOutcome: string }) {
  const theme = categoryThemes[market.category] ?? categoryThemes.New;
  return (
    <div className="category-event-board">
      <div className="category-event-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(13,5,17,.92), rgba(13,5,17,.38)), url(${theme.hero})` }}>
        <span>{theme.kicker}</span>
        <strong>{selectedOutcome} evidence desk</strong>
        <p>{theme.description}</p>
      </div>
      <div className="category-signal-grid">
        {theme.cards.map((card) => (
          <article key={card.title} style={{ backgroundImage: `linear-gradient(180deg, rgba(10,4,13,.2), rgba(10,4,13,.92)), url(${card.image})` }}>
            <span>{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.detail}</p>
          </article>
        ))}
      </div>
      <div className="oracle-source-strip">
        {theme.sources.map((source) => (
          <span key={source}>{source}</span>
        ))}
        <em>{market.source ?? "Public evidence"} / closes {market.closes}</em>
      </div>
    </div>
  );
}

function WeatherTicker({
  weather,
  weatherStatus,
  location,
  market
}: {
  weather: WeatherSnapshot | null;
  weatherStatus: "idle" | "loading" | "live" | "error";
  location: string;
  market: Market;
}) {
  const temp = formatWeatherValue(weather?.current?.temperature_2m, weather?.units?.temperature_2m);
  const feels = formatWeatherValue(weather?.current?.apparent_temperature, weather?.units?.apparent_temperature);
  const wind = formatWeatherValue(weather?.current?.wind_speed_10m, weather?.units?.wind_speed_10m);
  const rain = formatWeatherValue(weather?.current?.precipitation, weather?.units?.precipitation);
  const place = weather?.location ?? location;
  const label = isFootballMarket(market) ? "Football weather" : "Market weather";

  return (
    <div className="weather-ticker">
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <div className="ticker-set" key={copy}>
            <span><CloudSun size={15} />{label}</span>
            <strong>{weatherStatus === "loading" ? "Loading live weather" : place}</strong>
            <em>Temp {temp}</em>
            <em>Feels {feels}</em>
            <em>Wind {wind}</em>
            <em>Rain {rain}</em>
            <em>{isFootballMarket(market) ? "Pitch and travel context for World Cup markets" : "Public context for oracle review"}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

function TxTimeline({ steps }: { steps: string[] }) {
  return (
    <div className="tx-timeline">
      {steps.map((step, index) => (
        <div key={`${step}-${index}`} className={index === steps.length - 1 ? "current" : ""}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </div>
      ))}
    </div>
  );
}

function LiquidityPanel({
  amount,
  busy,
  onAmount,
  onAdd,
  market
}: {
  amount: string;
  busy: boolean;
  onAmount: (value: string) => void;
  onAdd: () => void;
  market: Market;
}) {
  return (
    <div className="liquidity-panel">
      <h2><Coins size={18} />Liquidity</h2>
      <p>{market.liquidity} active depth</p>
      <label>GEN amount<input value={amount} onChange={(event) => onAmount(event.target.value)} /></label>
      <div className="pool-bars">
        {market.outcomes.slice(0, 4).map((outcome) => (
          <div key={outcome.name}>
            <span>{outcome.name}</span>
            <strong>{outcome.price}%</strong>
            <em style={{ width: `${outcome.price}%` }} />
          </div>
        ))}
      </div>
      <button onClick={onAdd} disabled={busy}><Plus size={15} />{busy ? "Adding..." : "Add liquidity"}</button>
    </div>
  );
}

function MarketBoard({
  view,
  markets,
  activeMarketId,
  onSelectMarket
}: {
  view: "Markets" | "Outcomes" | "Volume";
  markets: Market[];
  activeMarketId: number;
  onSelectMarket: (market: Market) => void;
}) {
  if (view === "Outcomes") {
    return (
      <div className="outcome-board">
        {markets.flatMap((market) =>
          market.outcomes.map((outcome) => (
            <button key={`${market.id}-${outcome.name}`} onClick={() => onSelectMarket(market)}>
              <span>{market.title}</span>
              <strong>{outcome.name}</strong>
              <em className={outcome.side}>{outcome.price}c {outcome.change}</em>
            </button>
          ))
        )}
      </div>
    );
  }

  if (view === "Volume") {
    return (
      <div className="volume-board">
        {[...markets].sort((a, b) => parseMoney(b.volume) - parseMoney(a.volume)).map((market) => (
          <button key={market.id} onClick={() => onSelectMarket(market)}>
            <span>{market.source ?? market.tag}</span>
            <strong>{market.title}</strong>
            <em>{market.volume}</em>
            <div><span style={{ width: `${Math.min(100, parseMoney(market.volume) / Math.max(1, parseMoney(markets[0]?.volume ?? "$1")) * 100)}%` }} /></div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="market-grid">
      {markets.map((market) => (
        <article key={market.id} className={market.id === activeMarketId ? "market-card focused" : "market-card"} onClick={() => onSelectMarket(market)}>
          <div className="market-card-head">
            <div className="token">{market.category.slice(0, 2).toUpperCase()}</div>
            <div>
              <h3>{market.title}</h3>
              <p>{market.tag} / {market.source ?? "Predicto"} / closes {market.closes}</p>
            </div>
          </div>
          <div className="mini-outcomes">
            {market.outcomes.slice(0, 3).map((outcome) => (
              <div key={outcome.name}>
                <span>{outcome.name}</span>
                <strong>{outcome.price}c</strong>
              </div>
            ))}
          </div>
          <div className="market-foot">
            <span>Vol {market.volume}</span>
            <span>Liq {market.liquidity}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function parseMoney(value: string) {
  const normalized = value.replace("$", "").replace(",", "").trim();
  const multiplier = normalized.endsWith("B") ? 1_000_000_000 : normalized.endsWith("M") ? 1_000_000 : normalized.endsWith("K") ? 1_000 : 1;
  return Number(normalized.replace(/[BMK]/g, "")) * multiplier || 0;
}

function inferWeatherLocation(market: Market, outcome: string) {
  const text = `${outcome} ${market.title} ${market.category}`.toLowerCase();
  if (text.includes("france")) return "France";
  if (text.includes("argentina")) return "Argentina";
  if (text.includes("brazil")) return "Brazil";
  if (text.includes("england")) return "England";
  if (text.includes("usa") || text.includes("united states")) return "United States";
  if (text.includes("canada")) return "Canada";
  if (text.includes("mexico")) return "Mexico";
  if (text.includes("solana")) return "San Francisco";
  if (text.includes("bnb")) return "Singapore";
  return "New York";
}

function isFootballMarket(market: Market) {
  return market.category === "World Cup" || market.tag === "Football";
}

function isCryptoMarket(market: Market) {
  return market.category === "Crypto" || ["Price", "Fundamentals", "Binance"].includes(market.tag);
}

function buildWorldCupOutcomes(market: Market): Market["outcomes"] {
  const seeded = new Map(market.outcomes.map((outcome) => [outcome.name.toLowerCase(), outcome]));
  const favoritePrices: Record<string, number> = {
    France: 31,
    Argentina: 24,
    Brazil: 18,
    England: 12,
    Spain: 11,
    Portugal: 10,
    Germany: 9,
    Netherlands: 8,
    Belgium: 7,
    USA: 6,
    Mexico: 5,
    Canada: 4
  };

  return worldCupTeams.map((team, index) => {
    const existing = seeded.get(team.name.toLowerCase());
    if (existing) return existing;
    const price = favoritePrices[team.name] ?? Math.max(1, 7 - Math.floor(index / 7));
    const changeValue = ((index % 5) - 2) * 0.7;
    const change = `${changeValue >= 0 ? "+" : ""}${changeValue.toFixed(1)}%`;
    return {
      name: team.name,
      price,
      change,
      side: changeValue >= 0 ? "up" : "down"
    };
  });
}

function flagUrl(code: string) {
  const iso = countryIso[code] ?? "un";
  return `https://flagcdn.com/w40/${iso}.png`;
}

function flagForOutcome(name: string) {
  const normalized = name.toLowerCase();
  const team = worldCupTeams.find((item) => item.name.toLowerCase() === normalized);
  if (team) return flagUrl(team.code);
  if (normalized.includes("france")) return flagUrl("FRA");
  if (normalized.includes("argentina")) return flagUrl("ARG");
  if (normalized.includes("brazil")) return flagUrl("BRA");
  if (normalized.includes("england")) return flagUrl("ENG");
  return "https://flagcdn.com/w40/un.png";
}

function formatWeatherValue(value: number | undefined, unit = "") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return `${Math.round(value * 10) / 10}${unit}`;
}

function extractErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return cleanErrorMessage(error.message);
  if (typeof error === "string") return cleanErrorMessage(error);
  try {
    return cleanErrorMessage(JSON.stringify(error));
  } catch {
    return "Transaction failed";
  }
}

function cleanErrorMessage(message: string) {
  const compact = message.replace(/\s+/g, " ").trim();
  if (!compact) return "Transaction failed";
  try {
    const parsed = JSON.parse(compact);
    if (parsed?.message) return cleanErrorMessage(String(parsed.message));
  } catch {
    // Keep the original message when it is not JSON.
  }
  if (compact.includes("wallet_getSnaps") || compact.includes("wallet_requestSnaps")) {
    return "This wallet does not support MetaMask Snaps or the GenLayer Snap is not enabled. Use MetaMask with Snaps support and approve the GenLayer Snap in GenLayer Studio.";
  }
  if (compact.length <= 180) return compact;
  return `${compact.slice(0, 180)}...`;
}

function isSnapError(message: string) {
  return message.toLowerCase().includes("snap") || message.includes("wallet_getSnaps") || message.includes("wallet_requestSnaps");
}

function AiPanel({
  question,
  answer,
  loading,
  onQuestion,
  onAsk
}: {
  question: string;
  answer: string;
  loading: boolean;
  onQuestion: (value: string) => void;
  onAsk: () => void;
}) {
  return (
    <div className="ai-panel">
      <h2><Bot size={18} />AI market analyst</h2>
      <textarea value={question} onChange={(event) => onQuestion(event.target.value)} />
      <button onClick={onAsk} disabled={loading}>{loading ? "Analyzing..." : <><Sparkles size={16} />Ask AI</>}</button>
      {answer && <p>{answer}</p>}
    </div>
  );
}

function GenLayerPanel({
  contractAddress,
  network,
  dataSources,
  onchain,
  status
}: {
  contractAddress: string;
  network: string;
  dataSources: string[];
  onchain: OnchainMarketSnapshot | null;
  status: string;
}) {
  return (
    <div className="genlayer-panel">
      <h2><ShieldCheck size={18} />GenLayer network</h2>
      <div><span>Network</span><strong>{network}</strong></div>
      <div><span>Contract</span><strong>{shortAddress(contractAddress)}</strong></div>
      <div><span>Methods</span><strong>factory / trade / evidence / dispute</strong></div>
      <div><span>Read path</span><strong>{onchain?.exists ? "Live contract reads" : "Waiting for on-chain market"}</strong></div>
      <div><span>Settlement balance</span><strong>{onchain?.balanceGEN ?? "0.0000"} GEN</strong></div>
      <p>Market resolution is designed around GenLayer web evidence and AI consensus. Live prices are pulled from public exchange APIs, then resolved by contract rules.</p>
      <p>{status}</p>
      <div className="source-list">
        {dataSources.map((source) => <span key={source}>{source}</span>)}
      </div>
    </div>
  );
}

function CreateMarketView({
  value,
  busy,
  onChange,
  onSubmit
}: {
  value: CreateMarketState;
  busy: boolean;
  onChange: (value: CreateMarketState) => void;
  onSubmit: () => void;
}) {
  function update(field: keyof CreateMarketState, nextValue: string) {
    onChange({ ...value, [field]: nextValue });
  }

  return (
    <section className="create-view">
      <div className="create-head">
        <span className="micro">Market factory</span>
        <h1>Create prediction market</h1>
        <p>Draft a market, define outcomes, and submit it through the Predicto API. The GenLayer contract mirrors the same create and resolve flow on-chain.</p>
      </div>
      <div className="create-form">
        <label>Title<input value={value.title} onChange={(event) => update("title", event.target.value)} /></label>
        <label>Category<input value={value.category} onChange={(event) => update("category", event.target.value)} /></label>
        <label>Tag<input value={value.tag} onChange={(event) => update("tag", event.target.value)} /></label>
        <label>Close date<input value={value.closes} onChange={(event) => update("closes", event.target.value)} /></label>
        <label className="wide">Outcomes<input value={value.outcomes} onChange={(event) => update("outcomes", event.target.value)} /></label>
        <label className="wide">Resolution rules<textarea value={value.rules} onChange={(event) => update("rules", event.target.value)} /></label>
        <button onClick={onSubmit} disabled={busy}>{busy ? "Creating..." : <><Plus size={16} />Create market via API</>}</button>
      </div>
    </section>
  );
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function parseGEN(value: number) {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  return BigInt(Math.round(safe * 1_000_000)) * BigInt("1000000000000");
}

function formatGEN(value: bigint) {
  const base = BigInt("1000000000000000000");
  const fractionBase = BigInt("100000000000000");
  const whole = value / base;
  const fraction = (value % base) / fractionBase;
  return `${whole}.${fraction.toString().padStart(4, "0")}`;
}

function OrderBook({ market }: { market: Market }) {
  const asks = market.outcomes.map((outcome, index) => ({
    name: outcome.name,
    price: Math.min(99, outcome.price + index + 2),
    size: 1200 - index * 180
  }));
  const bids = market.outcomes.map((outcome, index) => ({
    name: outcome.name,
    price: Math.max(1, outcome.price - index - 2),
    size: 950 - index * 130
  }));

  return (
    <div className="book">
      <h2><BarChart3 size={18} />Order book</h2>
      <div className="book-head"><span>Outcome</span><span>Bid</span><span>Ask</span><span>Depth</span></div>
      {market.outcomes.map((outcome, index) => (
        <div key={outcome.name} className="book-row enhanced">
          <span>{outcome.name}</span>
          <strong>{bids[index].price}c</strong>
          <strong>{asks[index].price}c</strong>
          <em>
            <i style={{ width: `${Math.min(100, asks[index].size / 12)}%` }} />
            ${(asks[index].size + bids[index].size).toLocaleString()}
          </em>
        </div>
      ))}
      <div className="fills">
        <h3>Recent fills</h3>
        {market.outcomes.slice(0, 4).map((outcome, index) => (
          <div key={`${outcome.name}-fill`}>
            <span>{index % 2 ? "Sell" : "Buy"} {outcome.name}</span>
            <strong>{outcome.price}c</strong>
            <em>{(12 + index * 7).toFixed(2)} GEN</em>
          </div>
        ))}
      </div>
    </div>
  );
}

function Rules({ market, onchain, status }: { market: Market; onchain: OnchainMarketSnapshot | null; status: string }) {
  return (
    <div className="rules">
      <h2>Resolution rules</h2>
      <p>{market.note}</p>
      {market.sourceUrl && <a href={market.sourceUrl} target="_blank" rel="noreferrer">Open source data</a>}
      <p>Markets resolve through public sources, oracle review, and GenLayer-style consensus checks. Ambiguous outcomes remain open until the evidence threshold is met.</p>
      <div><span>On-chain status</span><strong>{onchain?.status ?? "Unknown"}</strong></div>
      <div><span>Evidence / disputes</span><strong>{`${onchain?.evidenceCount ?? 0} / ${onchain?.disputeCount ?? 0}`}</strong></div>
      <p>{onchain?.resolutionNote || status}</p>
    </div>
  );
}

function Oracle({
  market,
  evidenceUrl,
  evidenceNote,
  disputeNote,
  busy,
  status,
  onEvidenceUrl,
  onEvidenceNote,
  onDisputeNote,
  onSubmitEvidence,
  onSubmitDispute,
  onResolve
}: {
  market: Market;
  evidenceUrl: string;
  evidenceNote: string;
  disputeNote: string;
  busy: boolean;
  status: string;
  onEvidenceUrl: (value: string) => void;
  onEvidenceNote: (value: string) => void;
  onDisputeNote: (value: string) => void;
  onSubmitEvidence: () => void;
  onSubmitDispute: () => void;
  onResolve: () => void;
}) {
  return (
    <div className="oracle">
      <h2>Oracle route</h2>
      <div><span>Primary source</span><strong>{market.category} public data</strong></div>
      <div><span>Live API</span><strong>{market.source ?? "Predicto"}</strong></div>
      <div><span>Review mode</span><strong>AI evidence consensus</strong></div>
      <div><span>Status</span><strong>{busy ? "Writing on-chain" : "Ready"}</strong></div>
      <label>
        Evidence URL
        <input value={evidenceUrl} onChange={(event) => onEvidenceUrl(event.target.value)} />
      </label>
      <label>
        Evidence note
        <textarea value={evidenceNote} onChange={(event) => onEvidenceNote(event.target.value)} />
      </label>
      <button onClick={onSubmitEvidence} disabled={busy}><Plus size={15} />Submit evidence</button>
      <label>
        Dispute note
        <textarea value={disputeNote} onChange={(event) => onDisputeNote(event.target.value)} />
      </label>
      <button onClick={onSubmitDispute} disabled={busy}><ShieldCheck size={15} />Open dispute</button>
      <button onClick={onResolve} disabled={busy}><Zap size={15} />Resolve with evidence</button>
      {status && <p className="api-note">{status}</p>}
    </div>
  );
}

function Portfolio({ feed, positions, busy }: { feed: string[]; positions: Position[]; busy: boolean }) {
  const totalValue = positions.reduce((sum, item) => sum + item.amount, 0);
  const exposure = positions.reduce((sum, item) => sum + item.shares, 0);

  return (
    <section className="portfolio-view">
      <div className="portfolio-card">
        <span><Wallet size={15} /> Total value</span>
        <strong>${totalValue.toFixed(2)}</strong>
        <em>{exposure.toFixed(2)} active shares</em>
      </div>
      <div className="portfolio-table">
        <h2><ShoppingCart size={18} />Open positions</h2>
        {busy && <p>Refreshing on-chain positions...</p>}
        {!busy && positions.length === 0 && <p>No on-chain positions yet. Place a trade from the Markets tab.</p>}
        {positions.map((position) => (
          <div key={position.id}>
            <span>{position.marketTitle}</span>
            <strong>{position.outcome} @ {position.price}c</strong>
            <em>${position.amount.toFixed(2)}</em>
          </div>
        ))}
      </div>
      <div className="activity-feed">
        <h2><Activity size={18} />Activity</h2>
        {feed.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}

function Leaderboard({
  walletAddress,
  positions,
  tickets
}: {
  walletAddress: string;
  positions: Position[];
  tickets: number;
}) {
  const [sortBy, setSortBy] = useState<"volume" | "pnl" | "tickets">("volume");
  const userVolume = positions.reduce((sum, item) => sum + item.amount, 0);
  const rows = [
    ...leaderboard,
    {
      address: walletAddress ? shortAddress(walletAddress) : "You",
      volume: userVolume,
      pnl: positions.length ? 3.2 : 0,
      tickets
    }
  ].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <section className="leaderboard-view">
      <h1>Leaderboard</h1>
      <div className="view-tabs">
        <button className={sortBy === "volume" ? "active" : ""} onClick={() => setSortBy("volume")}>Volume</button>
        <button className={sortBy === "pnl" ? "active" : ""} onClick={() => setSortBy("pnl")}>PnL</button>
        <button className={sortBy === "tickets" ? "active" : ""} onClick={() => setSortBy("tickets")}>Tickets</button>
      </div>
      {rows.map((row, index) => (
        <div className="rank-row" key={`${row.address}-${index}`}>
          <span>#{index + 1}</span>
          <strong>{row.address}</strong>
          <em>${row.volume.toLocaleString()}</em>
          <b>{row.pnl >= 0 ? "+" : ""}{row.pnl.toFixed(1)}%</b>
          <i>{row.tickets} tickets</i>
        </div>
      ))}
    </section>
  );
}

function Tickets({ missions, onClaim }: { missions: Mission[]; onClaim: (id: string) => void }) {
  return (
    <section className="tickets-view">
      <div>
        <h1>Earn Tickets</h1>
        <p>Complete market missions, provide liquidity, and review oracle disputes to earn weekly prediction tickets.</p>
      </div>
      {missions.map((mission, index) => {
        const complete = mission.progress >= mission.target;
        return (
        <article key={mission.id} className={mission.claimed ? "claimed" : ""}>
          <span>Mission {index + 1}</span>
          <h2>{mission.title}</h2>
          <div className="progress-track"><span style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }} /></div>
          <p>{Math.min(mission.progress, mission.target).toFixed(mission.target > 10 ? 0 : 0)} / {mission.target} progress</p>
          <button disabled={!complete || mission.claimed} onClick={() => onClaim(mission.id)}>
            {mission.claimed ? "Claimed" : complete ? <><Gift size={15} />Claim {mission.reward} tickets</> : "In progress"}
          </button>
        </article>
        );
      })}
    </section>
  );
}
