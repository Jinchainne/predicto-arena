import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.marketId !== "number") {
    return NextResponse.json({ error: "marketId is required." }, { status: 400 });
  }
  if (typeof body.outcome !== "string" || body.outcome.trim().length < 1) {
    return NextResponse.json({ error: "outcome is required." }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be positive." }, { status: 400 });
  }

  const side = body.side === "sell" ? "sell" : "buy";
  const wallet = typeof body.wallet === "string" && body.wallet ? body.wallet : "guest";
  const ticketId = `px-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  return NextResponse.json({
    ticketId,
    status: "accepted",
    side,
    wallet,
    marketId: body.marketId,
    outcome: body.outcome,
    amount,
    createdAt: new Date().toISOString()
  });
}
