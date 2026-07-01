# Predicto Arena Submission

## Contribution Type

Builder -> Projects

## Title

Predicto Arena - GenLayer Prediction Market Terminal

## Description

Predicto Arena is a GenLayer-powered prediction market terminal. Users browse markets backed by live Binance/Binance.US and CoinGecko public APIs, filter categories, open market detail layers, inspect outcome prices, view TradingView charts, use order book/rules/oracle tabs, create markets, submit wallet-signed GenLayer trades, provide liquidity, connect an EVM wallet, ask an in-app AI market analyst, review portfolio positions, and track leaderboard/ticket missions.

The project is GenLayer-native because market settlement needs transparent oracle resolution. The deployed contract includes an on-chain market factory, external market id mapping for live API markets, AMM-style buy/sell/liquidity methods, quote views, public-source resolution, and claim accounting for winning positions.

## Portal Notes / Description

Predicto Arena is an end-to-end GenLayer prediction market terminal. GenLayer is central to the project: a deployed StudioNet Intelligent Contract acts as the market factory, mirrors live API markets on-chain, stores trading/liquidity state, exposes quote views, resolves markets from public web evidence with AI validator consensus, and tracks winning claims. The frontend adds a DEX-style trading surface, wallet flow, oracle/rules panels, live Binance/CoinGecko data, AI market analysis, World Cup 2026 event boards, and live weather context. This fits Builder -> Projects because it is a complete GenLayer app, not just a demo UI.

## Why This Meets Builder Criteria

- Complete product workflow with live app, repo, contract, API routes, and deploy docs.
- Uses a GenLayer Intelligent Contract as the core protocol layer.
- Demonstrates web/evidence-based outcome resolution, one of GenLayer's strongest use cases.
- Shows useful non-demo UX: market discovery, wallet trade flow, liquidity, portfolio, leaderboard, AI analysis, rules/oracle views, weather/context data.
- Provides verifiable evidence: GitHub, Vercel production URL, StudioNet contract address, and reproducible build/test/deploy scripts.

## Evidence

- GitHub: https://github.com/Jinchainne/predicto-arena
- Live app: https://predicto-arena.vercel.app
- Contract address: `0x99EeB36b0BbC46bc00227d16d0b884DD9940994f`
- Network: studionet
