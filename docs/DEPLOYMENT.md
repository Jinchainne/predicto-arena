# Deployment Guide

## Contract

Deploy to the public GenLayer Studio network:

```bash
GENLAYER_CHAIN=studionet npm run deploy:sdk
```

The deploy script waits for finalization, checks execution success, extracts the contract address, verifies `get_total_markets`, and writes `frontend/.env.local`.

## Frontend

Set Vercel production variables:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xD7d8740903A0E8c5d587F262f9c96D121F1D42Ad
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
AI_API_KEY=your_server_side_ai_key
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
```

Deploy:

```bash
npx vercel deploy --prod
```

Leave `NEXT_PUBLIC_GENLAYER_RPC_URL` unset for the built-in `studionet` preset unless using a custom public RPC.

Current production URL: https://predicto-arena.vercel.app
