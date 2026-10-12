import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getStripe, priceIdFor, type CheckoutType } from "@/lib/stripe";

const TYPES: CheckoutType[] = ["core", "plus", "question", "livechat"];

/**
 * POST /api/checkout { type: 'core'|'plus'|'question'|'livechat' }
 * Authenticated users only. Creates a Stripe Checkout Session and returns { url }.
 * Subscriptions (core/plus) use subscription mode; one-time advice products use payment mode.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Checkout isn't switched on yet — join with a beta invite link instead." },
      { status: 503 }
    );
  }

  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { type } = (await req.json().catch(() => ({}))) as { type?: CheckoutType };
  if (!type || !TYPES.includes(type)) {
    return NextResponse.json({ error: "Unknown checkout type." }, { status: 400 });
  }

  const price = priceIdFor(type);
  if (!price) {
    return NextResponse.json(
      { error: "That price isn't configured yet. Tell me and I'll fix it." },
      { status: 503 }
    );
  }

  const origin = new URL(req.url).origin;
  const isSubscription = type === "core" || type === "plus";

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    metadata: { user_id: user.id, type },
    ...(isSubscription
      ? { subscription_data: { metadata: { user_id: user.id, type } } }
      : {}),
    success_url: `${origin}/join/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/plans`,
  });

  return NextResponse.json({ url: session.url });
}
