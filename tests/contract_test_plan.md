# Contract Test Plan

## Syntax

- Run `python -m py_compile contracts/predicto_arena.py`.

## Deployment

- Deploy with `GENLAYER_CHAIN=studionet npm run deploy:sdk`.
- Confirm the transaction finalized without `FINISHED_WITH_ERROR`.
- Confirm `get_total_markets` returns `0` after deployment.

## Functional Flow

1. `create_market` with valid title, category, rules, source URL, and outcomes.
2. `buy_position` with a valid market ID, outcome index, and amount.
3. `resolve_market` after the market close and confirm the winning outcome is stored.
4. `get_market`, `get_outcome`, and `get_position` return expected state.

## Expected Validation Errors

- Reject short titles or resolution rules.
- Reject invalid source URLs.
- Reject markets with fewer than two outcomes.
- Reject trades on resolved or closed markets.
