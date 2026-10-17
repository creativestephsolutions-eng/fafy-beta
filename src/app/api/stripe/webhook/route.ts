import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, mapSubscriptionStatus, planFromPrice, getFreeMonthCoupon } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs"; // Stripe SDK needs Node, not the edge runtime

function currentPeriodEnd(sub: Stripe.Subscription): string | null {
  const ts = (sub as unknown as { current_period_end?: number }).current_period_end;
  return typeof ts === "number" ? new Date(ts * 1000).toISOString() : null;
}

/**
 * Invite reward: when a member has 5+ accepted invites (invitees holding an
 * active/trialing Stripe subscription) and hasn't received the free month yet,
 * apply the 100%-off-once coupon to their active subscription.
 */
async function checkInviteReward(stripe: Stripe, userId: string) {
  const sb = supabaseAdmin();
  const { data: me } = await sb.from("profiles")
    .select("invite_reward_given").eq("id", userId).single();
  if (!me || me.invite_reward_given) return;

  const { data: invitees } = await sb.from("profiles").select("id").eq("invited_by", userId);
  const inviteeIds = (invitees ?? []).map((r: any) => r.id);
  if (inviteeIds.length < 5) return;
  const { data: subs } = await sb.from("subscriptions")
    .select("user_id").in("user_id", inviteeIds).in("status", ["active", "trialing"])
    .not("stripe_subscription_id", "is", null);
  const accepted = new Set((subs ?? []).map((s: any) => s.user_id)).size;
  if (accepted < 5) return;

  // Find the inviter's own active subscription to discount.
  const { data: mine } = await sb.from("subscriptions")
    .select("stripe_subscription_id").eq("user_id", userId)
    .in("status", ["active", "trialing"]).not("stripe_subscription_id", "is", null)
    .limit(1).maybeSingle();
  if (!mine?.stripe_subscription_id) return; // no active sub yet — checked again on their next subscribe

  try {
    const coupon = await getFreeMonthCoupon(stripe);
    await stripe.subscriptions.update(mine.stripe_subscription_id, { coupon: coupon.id });
    await sb.from("profiles").update({ invite_reward_given: true }).eq("id", userId);
    console.log("[stripe] invite free month applied", { user_id: userId, accepted });
  } catch (err) {
    console.error("[stripe] invite reward failed:", err instanceof Error ? err.message : err);
  }
}

async function handleEvent(stripe: Stripe, event: Stripe.Event) {
  const sb = supabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      console.log("[stripe] checkout.session.completed", {
        id: s.id,
        type: s.metadata?.type,
        user_id: s.metadata?.user_id,
        amount_total: s.amount_total,
        mode: s.mode,
      });
      // Subscription checkouts are recorded by the subscription.* events below.
      // One-time advice payments are matched to inbox threads by Stephanie in the admin panel.
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      const priceId = sub.items.data[0]?.price?.id;
      const plan = planFromPrice(priceId);
      if (!userId || !plan) {
        console.log("[stripe] subscription event missing user_id or known plan — skipping", sub.id);
        break;
      }
      const customerId =
        typeof sub.customer === "string" ? sub.customer : (sub.customer?.id ?? null);
      const { error } = await sb.from("subscriptions").upsert(
        {
          user_id: userId,
          plan,
          status: mapSubscriptionStatus(sub.status),
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          current_period_end: currentPeriodEnd(sub),
        },
        { onConflict: "stripe_subscription_id" }
      );
      if (error) {
        console.error("[stripe] subscriptions upsert failed:", error.message);
        break;
      }
      // Keep the member's plan in sync with their live subscription.
      const { error: pErr } = await sb.from("profiles").update({ plan }).eq("id", userId);
      if (pErr) console.error("[stripe] profile plan sync failed:", pErr.message);

      // Invite rewards: the subscriber may have just hit 5 accepted invites,
      // or this new subscription may be the one that pushes their inviter to 5.
      const status = mapSubscriptionStatus(sub.status);
      if (status === "active" || status === "trialing") {
        await checkInviteReward(stripe, userId);
        const { data: sub } = await sb.from("profiles").select("invited_by").eq("id", userId).single();
        if (sub?.invited_by) await checkInviteReward(stripe, sub.invited_by);
      }
      break;
    }

    case "invoice.payment_succeeded":
    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      const subId =
        typeof inv.subscription === "string" ? inv.subscription : (inv.subscription?.id ?? null);
      if (!subId) break;
      const status = event.type === "invoice.payment_succeeded" ? "active" : "past_due";
      const { error } = await sb
        .from("subscriptions")
        .update({ status })
        .eq("stripe_subscription_id", subId);
      if (error) console.error("[stripe] invoice status update failed:", error.message);
      break;
    }

    default:
      break; // ignore everything else, but still 200
  }
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    console.error("[stripe-webhook] missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await req.text(); // raw body — required for signature verification
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error(
      "[stripe-webhook] signature verification failed:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    await handleEvent(stripe, event);
  } catch (err) {
    console.error("[stripe-webhook] handler error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
