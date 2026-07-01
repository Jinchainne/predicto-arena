# Predicto Arena

Predicto Arena is a GenLayer-powered prediction market terminal. It presents a full market exchange experience with categories, market discovery, nested market details, a trade ticket, order book, portfolio, leaderboard, ticket missions, and oracle-resolution panels.

The product is designed as a Builder -> Projects submission: a market terminal with layered navigation, market detail drawers, and oracle-aware settlement flows.

## Links

- Live app: https://predicto-arena.vercel.app
- GitHub: https://github.com/Jinchainne/predicto-arena
- Contract: `0x700fd6C7B42DE013EEaDeB594346fAA617A0Ecec`
- Network: studionet

## Core Experience

- Multi-layer market navigation with top-level sections and category filters.
- Featured market board with outcome prices and probability chart.
- Full TradingView embedded chart for BTC/ETH/BNB/SOL-style crypto market symbols.
- Animated marketplace-style UX with icon menus, live ticker strip, hover motion, and action feedback.
- Market cards that open a detailed trade drawer.
- Trade ticket with buy/sell side, amount, estimated shares, and payout.
- Nested drawer tabs for Trade, Book, Rules, and Oracle.
- Portfolio, Leaderboard, and Earn Tickets sections.
- Live market data API at `/api/markets` using Binance/Binance.US public REST, CoinGecko public REST, and GenLayer studionet metadata.
- Category-specific markets and imagery, including a football visual treatment for World Cup markets.
- Wallet trade flow that switches/adds GenLayer StudioNet and submits real `GEN` transactions through `genlayer-js`.
- GenLayer market factory that mirrors live API markets on-chain on the first trade.
- AMM-style protocol methods for buy, sell, add liquidity, quote reads, oracle resolution, and winning-claim accounting.
- DEX-style ticket with market/limit orders, slippage control, quick sizes, transaction timeline, liquidity panel, enhanced order book, depth bars, and recent fills.
- Market creation API through `POST /api/markets`.
- Trade ticket API through `POST /api/trades`.
- EVM wallet connection through `window.ethereum` for MetaMask-compatible wallets.
- In-app AI market analyst through `/api/ask` for market explanation and oracle analysis.
- Interactive Portfolio, Leaderboard, Earn Tickets, Market/Outcome/Volume tabs, and session persistence through `localStorage`.

## GenLayer Fit

Prediction markets need transparent resolution. Predicto Arena is built around a GenLayer-style oracle flow where public sources, market rules, and AI-assisted evidence review can be used to resolve outcomes with stronger transparency than a centralized moderator.

The deployed GenLayer contract supports market creation, external market mapping, AMM-style buying and selling, liquidity provision, quote reads, public-source resolution, and claim accounting for resolved winning positions.

TradingView is embedded as the live chart surface. Price/market APIs come from Binance/Binance.US and CoinGecko public APIs, while the GenLayer contract anchors the prediction market factory, trading, liquidity, and resolution layer.

## Run Locally

```bash
npm install
npm run build
npm run dev
```

## Environment

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x700fd6C7B42DE013EEaDeB594346fAA617A0Ecec
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
AI_API_KEY=your_server_side_ai_key
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
```

`AI_API_KEY` is server-only and must never use the `NEXT_PUBLIC_` prefix.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the frontend app. |
| `npm run build` | Build the production app. |
| `npm run test` | Run contract syntax and TypeScript checks. |
| `npm run deploy:sdk` | Deploy the GenLayer contract. |

## License

MIT
