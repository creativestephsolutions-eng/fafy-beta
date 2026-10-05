import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/**
 * Stripe webhook: keeps subscriptions in sync.
 * Add https://fafy.community/api/stripe/webhook in Stripe Dashboard →
 * Developers → Webhooks (checkout.session.completed,
 * customer.subscription.updated), with STRIPE_WEBHOOK_SECRET set.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whSecret) {
    return NextResponse.json({ ok: false, note: "Stripe not configured" }, { status: 200 });
  }

  const stripe = new Stripe(secret);
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (e) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const userId = s.metadata?.user_id;
    const plan = (s.metadata?.plan ?? "core") as "core" | "plus";
    if (userId) {
      await sb.from("subscriptions").insert({
        user_id: userId,
        plan,
        status: "active",
        stripe_customer_id: s.customer as string,
        stripe_subscription_id: s.subscription as string,
      });
      await sb.from("profiles").update({ plan }).eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const status =
      sub.status === "active" || sub.status === "trialing" ? "active"
      : sub.status === "past_due" ? "past_due" : "canceled";
    await sb.from("subscriptions")
      .update({ status, current_period_end: new Date(sub.current_period_end * 1000).toISOString() })
      .eq("stripe_subscription_id", sub.id);
  }

  return NextResponse.json({ received: true });
}
