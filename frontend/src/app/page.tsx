"use client";

import { useEffect, useMemo, useState } from "react";

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
};

type CreateMarketState = {
  title: string;
  category: string;
  tag: string;
  closes: string;
  outcomes: string;
  rules: string;
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
  ["0x75...A7Dd", "$18,420", "+22.4%"],
  ["0x11...9Caf", "$14,880", "+18.7%"],
  ["0x92...Bee1", "$11,506", "+15.1%"],
  ["0x33...F010", "$9,774", "+11.8%"]
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
  const [activeMarketId, setActiveMarketId] = useState(seedMarkets[0].id);
  const [tradeOutcome, setTradeOutcome] = useState(seedMarkets[0].outcomes[0].name);
  const [tradeSide, setTradeSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("25");
  const [drawerTab, setDrawerTab] = useState("Trade");
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
      setFeed((items) => [`AI analyzed ${activeMarket.title}`, ...items].slice(0, 6));
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request failed";
      setAiAnswer(message);
      setFeed((items) => [`AI error: ${message}`, ...items].slice(0, 6));
    } finally {
      setAiLoading(false);
    }
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
        <div className="logo-mark">PX</div>
        <nav className="main-nav">
          {navItems.map((item) => (
            <button key={item} className={activeNav === item ? "active" : ""} onClick={() => setActiveNav(item)}>{item}</button>
          ))}
        </nav>
        <label className="search">
          <span>Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search markets..." />
        </label>
        <button className="deposit" onClick={connectWallet}>{walletAddress ? "Connected" : "+ Connect"}</button>
        <div className="wallet-pill">$0.06 Bal</div>
        <div className="wallet-pill">$0.00 U.PnL</div>
        <button className={walletError ? "wallet-address wallet-alert" : "wallet-address"} onClick={connectWallet}>
          {walletAddress ? shortAddress(walletAddress) : walletError || (dataStatus === "loading" ? "Loading API" : dataStatus === "live" ? "API Live" : "Seed data")}
        </button>
      </header>

      <section className="category-strip">
        {categories.map((category) => (
          <button key={category} className={activeCategory === category ? "selected" : ""} onClick={() => setActiveCategory(category)}>{category}</button>
        ))}
        <button className="new-market" onClick={() => setActiveNav("Create")}>Create market</button>
      </section>

      {activeNav === "Markets" && (
        <section className="market-shell">
          <section className="left-stage">
            <div className="feature-market">
              <div className="feature-head">
                <div>
                  <span className="micro">Featured market</span>
                  <h1>{activeMarket.title}</h1>
                  <p>{activeMarket.note}</p>
                </div>
                <button onClick={submitTrade}>Trade now</button>
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
                <div className="chart-panel">
                  <svg viewBox="0 0 240 100" role="img" aria-label="Market probability chart">
                    <path d="M 0 90 H 240" />
                    <path d="M 0 60 H 240" />
                    <path d="M 0 30 H 240" />
                    <path className="spark" d={sparkPath(activeMarket.spark)} />
                  </svg>
                  <div className="chart-meta">
                    <span>Vol {activeMarket.volume}</span>
                    <span>Liq {activeMarket.liquidity}</span>
                    <span>Close {activeMarket.closes}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-title">
              <h2>{activeCategory === "All" ? "Trending markets" : `${activeCategory} markets`}</h2>
              <div className="view-tabs">
                <button className="active">Markets</button>
                <button>Outcomes</button>
                <button>Volume</button>
              </div>
            </div>

            <div className="market-grid">
              {filteredMarkets.map((market) => (
                <article key={market.id} className={market.id === activeMarket.id ? "market-card focused" : "market-card"} onClick={() => selectMarket(market)}>
                  <div className="market-card-head">
                    <div className="token">{market.category.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <h3>{market.title}</h3>
                      <p>{market.tag} / closes {market.closes}</p>
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
                  <button className="submit-trade" onClick={submitTrade}>{tradeSide === "buy" ? "Buy shares" : "Sell shares"}</button>
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
      {activeNav === "Portfolio" && <Portfolio feed={feed} />}
      {activeNav === "Leaderboard" && <Leaderboard />}
      {activeNav === "Earn Tickets" && <Tickets />}

      <footer className="status-bar">
        <span className="online-dot" /> Local 11:32:48
        <span>English</span>
        <span>Docs</span>
        <span>GenLayer oracle simulation</span>
      </footer>
    </main>
  );
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
      <h2>AI market analyst</h2>
      <textarea value={question} onChange={(event) => onQuestion(event.target.value)} />
      <button onClick={onAsk} disabled={loading}>{loading ? "Analyzing..." : "Ask AI"}</button>
      {answer && <p>{answer}</p>}
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
        <button onClick={onSubmit} disabled={busy}>{busy ? "Creating..." : "Create market via API"}</button>
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
      <p>Markets resolve through public sources, oracle review, and GenLayer-style consensus checks. Ambiguous outcomes remain open until the evidence threshold is met.</p>
    </div>
  );
}

function Oracle({ market }: { market: Market }) {
  return (
    <div className="oracle">
      <h2>Oracle route</h2>
      <div><span>Primary source</span><strong>{market.category} public data</strong></div>
      <div><span>Review mode</span><strong>AI evidence consensus</strong></div>
      <div><span>Status</span><strong>Ready</strong></div>
    </div>
  );
}

function Portfolio({ feed }: { feed: string[] }) {
  return (
    <section className="portfolio-view">
      <div className="portfolio-card">
        <span>Total value</span>
        <strong>$2,418.20</strong>
        <em>+14.2% this week</em>
      </div>
      <div className="portfolio-table">
        <h2>Open positions</h2>
        {["France World Cup", "BTC above $120K", "OpenAI benchmark lead"].map((name, index) => (
          <div key={name}>
            <span>{name}</span>
            <strong>{[31, 46, 38][index]}c</strong>
            <em>{["$804.20", "$422.10", "$318.00"][index]}</em>
          </div>
        ))}
      </div>
      <div className="activity-feed">
        <h2>Activity</h2>
        {feed.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}

function Leaderboard() {
  return (
    <section className="leaderboard-view">
      <h1>Leaderboard</h1>
      {leaderboard.map((row, index) => (
        <div className="rank-row" key={row[0]}>
          <span>#{index + 1}</span>
          <strong>{row[0]}</strong>
          <em>{row[1]}</em>
          <b>{row[2]}</b>
        </div>
      ))}
    </section>
  );
}

function Tickets() {
  return (
    <section className="tickets-view">
      <div>
        <h1>Earn Tickets</h1>
        <p>Complete market missions, provide liquidity, and review oracle disputes to earn weekly prediction tickets.</p>
      </div>
      {["Trade three active markets", "Provide $100 liquidity", "Review an oracle source", "Invite one forecaster"].map((mission, index) => (
        <article key={mission}>
          <span>Mission {index + 1}</span>
          <h2>{mission}</h2>
          <button>Claim reward</button>
        </article>
      ))}
    </section>
  );
}
