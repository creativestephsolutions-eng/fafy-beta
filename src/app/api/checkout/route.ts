import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

/**
 * Beta checkout: records/activates the subscription for the signed-in user.
 * Stripe-ready: when STRIPE_SECRET_KEY is set, this route should create a
 * real Checkout Session instead and return its URL. Real charges happen
 * only with live keys installed (public open, never beta).
 */
export async function POST() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: profile } = await sb.from("profiles").select("plan").eq("id", user.id).single();
  const plan = (profile?.plan ?? "core") as "core" | "plus";

  const { error } = await sb.from("subscriptions").insert({
    user_id: user.id,
    plan,
    status: "active",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // TODO (public launch): if process.env.STRIPE_SECRET_KEY, create a real
  // stripe.checkout.sessions.create(...) for the plan's price and return { url }.
  return NextResponse.json({ ok: true, plan });
}
