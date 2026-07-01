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
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trophy,
  Wallet,
  Zap
} from "lucide-react";

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
  side: "buy" | "sell";
  amount: number;
  price: number;
  shares: number;
  createdAt: string;
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
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const categories = ["All", "World Cup", "Crypto", "AI", "Politics", "Economy", "Sports", "Culture", "New"];
const navItems = ["Markets", "Portfolio", "Leaderboard", "Earn Tickets"];
const navIcons = { Markets: ChartCandlestick, Portfolio: ShoppingCart, Leaderboard: Trophy, "Earn Tickets": Gift };
const categoryIcons = { All: Globe2, "World Cup": Trophy, Crypto: Coins, AI: BrainCircuit, Politics: ShieldCheck, Economy: CircleDollarSign, Sports: Medal, Culture: Sparkles, New: Flame };

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
  const [contractAddress, setContractAddress] = useState("0xD7d8740903A0E8c5d587F262f9c96D121F1D42Ad");
  const [network, setNetwork] = useState("studionet");
  const [activeMarketId, setActiveMarketId] = useState(seedMarkets[0].id);
  const [tradeOutcome, setTradeOutcome] = useState(seedMarkets[0].outcomes[0].name);
  const [tradeSide, setTradeSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("25");
  const [drawerTab, setDrawerTab] = useState("Trade");
  const [marketView, setMarketView] = useState<"Markets" | "Outcomes" | "Volume">("Markets");
  const [search, setSearch] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
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
  const [aiQuestion, setAiQuestion] = useState("Explain the resolution risk for this market.");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
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
          setContractAddress(payload.contractAddress || "0xD7d8740903A0E8c5d587F262f9c96D121F1D42Ad");
          setNetwork(payload.network || "studionet");
          setActiveMarketId(nextMarkets[0].id);
          setTradeOutcome(nextMarkets[0].outcomes[0]?.name ?? "");
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
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("predicto-session");
    if (!saved) return;
    try {
      const session = JSON.parse(saved);
      if (Array.isArray(session.positions)) setPositions(session.positions);
      if (Array.isArray(session.missions)) setMissions(session.missions);
      if (Array.isArray(session.feed)) setFeed(session.feed);
      if (typeof session.tickets === "number") setTickets(session.tickets);
    } catch {
      window.localStorage.removeItem("predicto-session");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("predicto-session", JSON.stringify({ positions, missions, feed, tickets }));
  }, [feed, missions, positions, tickets]);

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
  const selectedOutcome = activeMarket.outcomes.find((outcome) => outcome.name === tradeOutcome) ?? activeMarket.outcomes[0];
  const estimatedShares = Number(amount || 0) / Math.max(1, selectedOutcome.price / 100);

  function selectMarket(market: Market) {
    setActiveMarketId(market.id);
    setTradeOutcome(market.outcomes[0].name);
    setDrawerTab("Trade");
    setFeed((items) => [`Opened ${market.title}`, ...items].slice(0, 6));
  }

  function openMarketView(view: "Markets" | "Outcomes" | "Volume") {
    setMarketView(view);
    setFeed((items) => [`Switched market board to ${view}`, ...items].slice(0, 6));
  }

  async function submitTrade() {
    setTradeStatus("Submitting trade...");
    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: activeMarket.id,
          outcome: tradeOutcome,
          side: tradeSide,
          amount: Number(amount || 0),
          wallet: walletAddress
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Trade API failed");
      const shares = Number(amount || 0) / Math.max(0.01, selectedOutcome.price / 100);
      setPositions((items) => [
        {
          id: result.ticketId,
          marketTitle: activeMarket.title,
          outcome: tradeOutcome,
          side: tradeSide,
          amount: Number(amount || 0),
          price: selectedOutcome.price,
          shares,
          createdAt: result.createdAt
        },
        ...items
      ]);
      updateMission("trade-3", 1);
      updateMission("liquidity-100", Number(amount || 0));
      setTradeStatus(`Accepted ${result.ticketId}`);
      setFeed((items) => [`${tradeSide.toUpperCase()} ${tradeOutcome} for $${amount || "0"} via API`, ...items].slice(0, 6));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Trade failed";
      setTradeStatus(message);
      setFeed((items) => [`Trade error: ${message}`, ...items].slice(0, 6));
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
      setMarketData((items) => [nextMarket, ...items]);
      setActiveMarketId(nextMarket.id);
      setTradeOutcome(nextMarket.outcomes[0]?.name ?? "");
      setActiveNav("Markets");
      setDrawerTab("Rules");
      updateMission("create-market", 1);
      setFeed((items) => [`Created market via API: ${nextMarket.title}`, ...items].slice(0, 6));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Market creation failed";
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

  async function connectWallet() {
    setWalletError("");
    if (!window.ethereum) {
      setWalletError("Wallet not found");
      setFeed((items) => ["Install MetaMask or another EVM wallet to connect", ...items].slice(0, 6));
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const firstAccount = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : "";
      if (!firstAccount) throw new Error("No wallet account returned");
      setWalletAddress(firstAccount);
      setFeed((items) => [`Wallet connected ${shortAddress(firstAccount)}`, ...items].slice(0, 6));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet connection rejected";
      setWalletError(message);
      setFeed((items) => [`Wallet error: ${message}`, ...items].slice(0, 6));
    }
  }

  return (
    <main className="terminal">
      <header className="topbar">
        <div className="logo-mark"><span /></div>
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
        <button className="deposit pulse-action" onClick={connectWallet}><Wallet size={16} />{walletAddress ? "Connected" : "Connect"}</button>
        <div className="wallet-pill">{tickets} Tickets</div>
        <div className="wallet-pill">${positions.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} Vol</div>
        <button className={walletError ? "wallet-address wallet-alert" : "wallet-address"} onClick={connectWallet}>
          {walletAddress ? shortAddress(walletAddress) : walletError || (dataStatus === "loading" ? "Loading API" : dataStatus === "live" ? "API Live" : "Seed data")}
        </button>
      </header>

      <section className="category-strip">
        {categories.map((category) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          return (
            <button key={category} className={activeCategory === category ? "selected" : ""} onClick={() => setActiveCategory(category)}>
              <Icon size={15} />{category}
            </button>
          );
        })}
        <button className="new-market" onClick={() => setActiveNav("Create")}><Plus size={15} />Create market</button>
      </section>

      {activeNav === "Markets" && (
        <section className="market-shell">
          <section className="left-stage">
            <div className="live-strip">
              <span><Zap size={15} /> Live exchange APIs</span>
              <strong>GenLayer studionet oracle-ready markets</strong>
              <button onClick={() => setActiveNav("Create")}>List a market <ChevronRight size={15} /></button>
            </div>
            <div className="feature-market">
              <div className="feature-head">
                <div>
                  <span className="micro">Featured market</span>
                  <h1>{activeMarket.title}</h1>
                  <p>{activeMarket.note}</p>
                </div>
                <button onClick={submitTrade}><Activity size={16} />Trade now</button>
              </div>
              <div className="feature-grid">
                <div className="outcome-stack">
                  {activeMarket.outcomes.map((outcome) => (
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
                <div className="chart-panel tradingview-panel">
                  <TradingViewChart market={activeMarket} />
                  <div className="chart-meta">
                    <span>Vol {activeMarket.volume}</span>
                    <span>Liq {activeMarket.liquidity}</span>
                    <span>Close {activeMarket.closes}</span>
                    <span>{activeMarket.source ?? "Predicto"}</span>
                  </div>
                </div>
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
                  <button key={tab} className={drawerTab === tab ? "active" : ""} onClick={() => setDrawerTab(tab)}>{tab}</button>
                ))}
              </div>
              {drawerTab === "Trade" && (
                <div className="ticket">
                  <h2>{selectedOutcome.name}</h2>
                  <p>{activeMarket.title}</p>
                  <div className="side-toggle">
                    <button className={tradeSide === "buy" ? "active" : ""} onClick={() => setTradeSide("buy")}>Buy</button>
                    <button className={tradeSide === "sell" ? "active" : ""} onClick={() => setTradeSide("sell")}>Sell</button>
                  </div>
                  <label>Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
                  <div className="quote-box">
                    <span>Price</span><strong>{selectedOutcome.price}c</strong>
                    <span>Est. shares</span><strong>{estimatedShares.toFixed(2)}</strong>
                    <span>Max payout</span><strong>${(estimatedShares).toFixed(2)}</strong>
                  </div>
                  <button className="submit-trade pulse-action" onClick={submitTrade}><ShoppingCart size={16} />{tradeSide === "buy" ? "Buy shares" : "Sell shares"}</button>
                  {tradeStatus && <span className="api-note">{tradeStatus}</span>}
                </div>
              )}
              {drawerTab === "Book" && <OrderBook market={activeMarket} />}
              {drawerTab === "Rules" && <Rules market={activeMarket} />}
              {drawerTab === "Oracle" && <Oracle market={activeMarket} />}
            </div>

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
            <GenLayerPanel contractAddress={contractAddress} network={network} dataSources={dataSources} />
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
      {activeNav === "Portfolio" && <Portfolio feed={feed} positions={positions} />}
      {activeNav === "Leaderboard" && <Leaderboard walletAddress={walletAddress} positions={positions} tickets={tickets} />}
      {activeNav === "Earn Tickets" && <Tickets missions={missions} onClaim={claimMission} />}

      <footer className="status-bar">
        <span className="online-dot" /> Live session
        <span>English</span>
        <span>Docs</span>
        <span>GenLayer oracle simulation</span>
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
  dataSources
}: {
  contractAddress: string;
  network: string;
  dataSources: string[];
}) {
  return (
    <div className="genlayer-panel">
      <h2><ShieldCheck size={18} />GenLayer network</h2>
      <div><span>Network</span><strong>{network}</strong></div>
      <div><span>Contract</span><strong>{shortAddress(contractAddress)}</strong></div>
      <div><span>Methods</span><strong>create / buy / resolve</strong></div>
      <p>Market resolution is designed around GenLayer web evidence and AI consensus. Live prices are pulled from public exchange APIs, then resolved by contract rules.</p>
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

function OrderBook({ market }: { market: Market }) {
  return (
    <div className="book">
      <h2>Order book</h2>
      {market.outcomes.map((outcome, index) => (
        <div key={outcome.name} className="book-row">
          <span>{outcome.name}</span>
          <strong>{outcome.price + index}c</strong>
          <em>${(1200 - index * 180).toLocaleString()}</em>
        </div>
      ))}
    </div>
  );
}

function Rules({ market }: { market: Market }) {
  return (
    <div className="rules">
      <h2>Resolution rules</h2>
      <p>{market.note}</p>
      {market.sourceUrl && <a href={market.sourceUrl} target="_blank" rel="noreferrer">Open source data</a>}
      <p>Markets resolve through public sources, oracle review, and GenLayer-style consensus checks. Ambiguous outcomes remain open until the evidence threshold is met.</p>
    </div>
  );
}

function Oracle({ market }: { market: Market }) {
  return (
    <div className="oracle">
      <h2>Oracle route</h2>
      <div><span>Primary source</span><strong>{market.category} public data</strong></div>
      <div><span>Live API</span><strong>{market.source ?? "Predicto"}</strong></div>
      <div><span>Review mode</span><strong>AI evidence consensus</strong></div>
      <div><span>Status</span><strong>Ready</strong></div>
    </div>
  );
}

function Portfolio({ feed, positions }: { feed: string[]; positions: Position[] }) {
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
        {positions.length === 0 && <p>No positions yet. Place a trade from the Markets tab.</p>}
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
