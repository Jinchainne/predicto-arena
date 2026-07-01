# Predicto Arena

**Predicto Arena** is a GenLayer-powered prediction market terminal for real-world events, live crypto markets, and evidence-based oracle resolution. It combines a modern DEX-style trading interface with a deployed GenLayer Intelligent Contract that handles market creation, trading state, liquidity, quotes, resolution, and winning-claim accounting.

This project is designed for **GenLayer Builders -> Projects**: a complete application where GenLayer is the protocol layer, not a cosmetic integration.

## Live Links

| Resource | Link |
| --- | --- |
| Production app | https://predicto-arena.vercel.app |
| GitHub repository | https://github.com/Jinchainne/predicto-arena |
| GenLayer StudioNet contract | `0x99EeB36b0BbC46bc00227d16d0b884DD9940994f` |
| Network | `studionet` |

## Why This Is a GenLayer Builder Project

Prediction markets depend on trustworthy answers to real-world questions. Many outcomes cannot be resolved by a simple price feed alone: they need public evidence, natural-language rules, source review, and consensus around ambiguous events.

Predicto Arena uses GenLayer where it matters most:

- **Intelligent Contract market factory**: live API markets can be mirrored on-chain by external market id.
- **On-chain trading state**: buy, sell, liquidity, volume, fee, position, and quote data are tracked by the contract.
- **Protocol lifecycle controls**: markets support open, paused, resolving, resolved, and canceled states.
- **Evidence and dispute rails**: users can append public evidence and open post-resolution disputes.
- **Evidence-based resolution**: `resolve_market` uses GenLayer web access and AI validator consensus to inspect public source URLs and select the winning outcome.
- **Claim accounting**: resolved winning positions can be claimed through contract state.
- **Wallet path**: the frontend connects to GenLayer StudioNet through `genlayer-js` and the GenLayer MetaMask Snap flow.

The frontend is the exchange terminal; the GenLayer Intelligent Contract is the protocol and oracle layer.

## Product Overview

Predicto Arena presents a full market-exchange experience:

- Multi-layer navigation for Markets, Portfolio, Leaderboard, and Earn Tickets.
- Category filters for World Cup, Crypto, AI, Politics, Economy, Sports, Culture, and new markets.
- DEX-style trade ticket with buy/sell, market/limit mode, quick sizes, slippage, and transaction timeline.
- Liquidity panel connected to the GenLayer contract flow.
- Order book, rules, and oracle tabs for each market.
- Live market APIs from Binance/Binance.US and CoinGecko.
- TradingView charts for crypto markets.
- World Cup 2026 football event board with match-themed imagery and verified participant cards instead of irrelevant financial charts.
- Bottom weather ticker powered by Open-Meteo for the selected market/team context.
- AI market analyst endpoint for resolution-risk explanation and oracle review.
- Portfolio, leaderboard, ticket missions, and local session persistence.

## Core GenLayer Contract

Contract: [`contracts/predicto_arena.py`](contracts/predicto_arena.py)

The deployed Intelligent Contract includes:

| Capability | Description |
| --- | --- |
| `create_market` | Creates a standalone prediction market. |
| `create_market_with_external_id` | Creates or maps a market to an external API/frontend id. |
| `ensure_market_and_buy` | Creates the market if needed, then buys an outcome in one transaction. |
| `buy_position` / `buy_position_by_external_id` | Adds user exposure to a market outcome. |
| `sell_position` / `sell_position_by_external_id` | Reduces an existing user position. |
| `add_liquidity` / `ensure_market_and_add_liquidity` | Adds balanced liquidity across market outcomes. |
| `get_quote` / `get_quote_by_external_id` | Exposes contract-side price, fee, net, and impact data. |
| `resolve_market` | Uses GenLayer web rendering and AI consensus to resolve a market from public evidence. |
| `add_evidence` | Appends a public source URL and note to a market evidence log. |
| `open_dispute` | Opens a post-resolution dispute with a reason note. |
| `pause_market` / `resume_market` / `cancel_market` | Adds lifecycle controls for safer market operations. |
| `claim_winnings` | Accounts for payout claims after resolution. |

## Architecture

```text
User Wallet
   |
   | MetaMask + GenLayer Snap
   v
Next.js Frontend -------------- Live APIs
   |                            - Binance/Binance.US
   |                            - CoinGecko
   |                            - Open-Meteo
   |                            - AI analysis endpoint
   v
genlayer-js
   |
   v
GenLayer StudioNet Intelligent Contract
   - market factory
   - trading state
   - liquidity state
   - quote views
   - oracle resolution
   - claim accounting
```

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Main prediction market terminal. |
| `/api/markets` | Live and thematic market feed. |
| `/api/trades` | Local trade ticket/session record endpoint. |
| `/api/ask` | AI market analyst and oracle-risk explanation. |
| `/api/weather` | Open-Meteo weather context for selected market/team. |

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** CSS modules/global CSS with responsive terminal layout
- **Blockchain SDK:** `genlayer-js`
- **Contract:** GenLayer Python Intelligent Contract
- **Market data:** Binance/Binance.US public REST, CoinGecko public REST
- **Weather context:** Open-Meteo public API
- **AI analysis:** OpenAI-compatible server-side API configuration
- **Deployment:** Vercel

## Environment

Create `frontend/.env.local` or configure Vercel Environment Variables:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x99EeB36b0BbC46bc00227d16d0b884DD9940994f
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
NEXT_PUBLIC_GENLAYER_RPC_URL=

AI_API_KEY=your_server_side_ai_key
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
```

`AI_API_KEY` is server-only. Do not prefix it with `NEXT_PUBLIC_`.

## Local Development

```bash
npm install
npm run dev
```

The app runs through the frontend workspace:

```bash
npm --prefix frontend run dev
```

## Build and Test

```bash
npm run test
npm run build
```

`npm run test` performs:

- Python syntax validation for the GenLayer contract.
- TypeScript type checking for the frontend.

## Deploy the GenLayer Contract

```bash
GENLAYER_CHAIN=studionet npm run deploy:sdk
```

The deploy script:

1. Reads `contracts/predicto_arena.py`.
2. Deploys it with `genlayer-js`.
3. Waits for finalized transaction status.
4. Verifies `get_total_markets`.
5. Writes the deployed address to `frontend/.env.local`.

## Deploy the Frontend

```bash
npx vercel deploy --prod
```

Production is currently deployed at:

```text
https://predicto-arena.vercel.app
```

## Builder Submission Notes

Recommended portal selection:

```text
Contribution Type: Builder -> Projects
Title: Predicto Arena - GenLayer Prediction Market Terminal
```

Suggested short description:

```text
Predicto Arena is a complete GenLayer prediction market terminal. A deployed StudioNet Intelligent Contract powers market creation, external market mapping, AMM-style buy/sell/liquidity state, quote reads, public-source oracle resolution, and winning-claim accounting. The frontend adds live market APIs, wallet-signed GenLayer transactions, rules/oracle panels, AI market analysis, World Cup 2026 event boards, and weather context.
```

Suggested evidence:

- GitHub: https://github.com/Jinchainne/predicto-arena
- Live app: https://predicto-arena.vercel.app
- Contract: `0x99EeB36b0BbC46bc00227d16d0b884DD9940994f`
- Network: `studionet`

## Repository Structure

```text
contracts/
  predicto_arena.py        GenLayer Intelligent Contract

frontend/
  src/app/                 Next.js app routes and UI
  src/app/api/markets      Live market feed
  src/app/api/trades       Trade ticket endpoint
  src/app/api/ask          AI analyst endpoint
  src/app/api/weather      Weather context endpoint

scripts/
  deploy.ts                GenLayer deployment script

docs/
  DEPLOYMENT.md            Deployment guide
  SUBMISSION.md            Builder submission copy
```

## License

MIT
