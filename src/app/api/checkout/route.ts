import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStripe, priceIdFor, getInviteCoupon, type CheckoutType } from "@/lib/stripe";

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

  // Friend-invite deal: first Core month is $7 ($2 off) for members who joined
  // with someone's invite code and haven't subscribed through Stripe before.
  // The coupon itself is duration:once, so it can only ever discount one invoice.
  // We check for an existing Stripe subscription (not a flag) so an abandoned
  // checkout doesn't burn the discount.
  let discounts: { coupon: string }[] | undefined;
  if (isSubscription && type === "core") {
    const admin = supabaseAdmin();
    const [{ data: prof }, { data: prior }] = await Promise.all([
      admin.from("profiles").select("invited_by").eq("id", user.id).single(),
      admin.from("subscriptions").select("id").eq("user_id", user.id).not("stripe_subscription_id", "is", null).limit(1),
    ]);
    if (prof?.invited_by && (!prior || prior.length === 0)) {
      const coupon = await getInviteCoupon(stripe);
      discounts = [{ coupon: coupon.id }];
      await admin.from("profiles").update({ invite_discount_used: true }).eq("id", user.id);
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price, quantity: 1 }],
    ...(discounts ? { discounts } : {}),
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
