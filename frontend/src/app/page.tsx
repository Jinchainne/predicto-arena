"use client";

import { useMemo, useState } from "react";

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

const categories = ["All", "World Cup", "Crypto", "AI", "Politics", "Economy", "Sports", "Culture", "New"];
const navItems = ["Markets", "Portfolio", "Leaderboard", "Earn Tickets"];

const markets: Market[] = [
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
  const [activeMarketId, setActiveMarketId] = useState(markets[0].id);
  const [tradeOutcome, setTradeOutcome] = useState(markets[0].outcomes[0].name);
  const [tradeSide, setTradeSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("25");
  const [drawerTab, setDrawerTab] = useState("Trade");
  const [search, setSearch] = useState("");
  const [feed, setFeed] = useState<string[]>(["Market terminal online", "Oracle route: GenLayer web consensus", "Wallet simulation ready"]);

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      const categoryMatch = activeCategory === "All" || market.category === activeCategory || market.tag === activeCategory;
      const searchMatch = market.title.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, search]);

  const activeMarket = markets.find((market) => market.id === activeMarketId) ?? markets[0];
  const selectedOutcome = activeMarket.outcomes.find((outcome) => outcome.name === tradeOutcome) ?? activeMarket.outcomes[0];
  const estimatedShares = Number(amount || 0) / Math.max(1, selectedOutcome.price / 100);

  function selectMarket(market: Market) {
    setActiveMarketId(market.id);
    setTradeOutcome(market.outcomes[0].name);
    setDrawerTab("Trade");
    setFeed((items) => [`Opened ${market.title}`, ...items].slice(0, 6));
  }

  function submitTrade() {
    setFeed((items) => [`${tradeSide.toUpperCase()} ${tradeOutcome} on ${activeMarket.title} for $${amount || "0"}`, ...items].slice(0, 6));
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
        <button className="deposit">+ Deposit</button>
        <div className="wallet-pill">$0.06 Bal</div>
        <div className="wallet-pill">$0.00 U.PnL</div>
        <div className="wallet-address">0x753...A7Dd</div>
      </header>

      <section className="category-strip">
        {categories.map((category) => (
          <button key={category} className={activeCategory === category ? "selected" : ""} onClick={() => setActiveCategory(category)}>{category}</button>
        ))}
        <button className="new-market">Create market</button>
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
                </div>
              )}
              {drawerTab === "Book" && <OrderBook market={activeMarket} />}
              {drawerTab === "Rules" && <Rules market={activeMarket} />}
              {drawerTab === "Oracle" && <Oracle market={activeMarket} />}
            </div>

            <div className="side-feed">
              <h2>New markets</h2>
              {markets.slice(1, 6).map((market) => (
                <button key={market.id} onClick={() => selectMarket(market)}>
                  <strong>{market.title}</strong>
                  <span>{market.volume} / {market.tag}</span>
                </button>
              ))}
            </div>
          </aside>
        </section>
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
