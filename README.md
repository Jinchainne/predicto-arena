# Predicto Arena

Predicto Arena is a GenLayer-powered prediction market terminal. It presents a full market exchange experience with categories, market discovery, nested market details, a trade ticket, order book, portfolio, leaderboard, ticket missions, and oracle-resolution panels.

The product is designed as a Builder -> Projects submission: a market terminal with layered navigation, market detail drawers, and oracle-aware settlement flows.

## Links

- Live app: https://predicto-arena.vercel.app
- GitHub: https://github.com/Jinchainne/predicto-arena
- Contract: `0xD7d8740903A0E8c5d587F262f9c96D121F1D42Ad`
- Network: studionet

## Core Experience

- Multi-layer market navigation with top-level sections and category filters.
- Featured market board with outcome prices and probability chart.
- Market cards that open a detailed trade drawer.
- Trade ticket with buy/sell side, amount, estimated shares, and payout.
- Nested drawer tabs for Trade, Book, Rules, and Oracle.
- Portfolio, Leaderboard, and Earn Tickets sections.
- Live market data API at `/api/markets` using Binance/Binance.US public REST, CoinGecko public REST, and GenLayer studionet metadata.
- Market creation API through `POST /api/markets`.
- Trade ticket API through `POST /api/trades`.
- EVM wallet connection through `window.ethereum` for MetaMask-compatible wallets.
- In-app AI market analyst through `/api/ask` for market explanation and oracle analysis.

## GenLayer Fit

Prediction markets need transparent resolution. Predicto Arena is built around a GenLayer-style oracle flow where public sources, market rules, and AI-assisted evidence review can be used to resolve outcomes with stronger transparency than a centralized moderator.

The deployed GenLayer contract supports market creation, position buying, public-source resolution, and view methods for markets, outcomes, and positions.

TradingView is supported as a charting/widget direction rather than a public REST price API; live price data in this implementation comes from Binance/Binance.US and CoinGecko public APIs.

## Run Locally

```bash
npm install
npm run build
npm run dev
```

## Environment

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xD7d8740903A0E8c5d587F262f9c96D121F1D42Ad
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
