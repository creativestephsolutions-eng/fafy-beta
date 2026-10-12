import Stripe from "stripe";

/** Checkout product types. Subscriptions: core/plus. One-time: question/livechat. */
export type CheckoutType = "core" | "plus" | "question" | "livechat";

let stripe: Stripe | null = null;

/** Lazy Stripe client. Returns null when STRIPE_SECRET_KEY isn't set — callers must 503, never crash. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) stripe = new Stripe(key);
  return stripe;
}

/** Map a checkout type to its Stripe Price ID (from env). Null when not configured. */
export function priceIdFor(type: CheckoutType): string | null {
  switch (type) {
    case "core":
      return process.env.STRIPE_PRICE_CORE || null;
    case "plus":
      return process.env.STRIPE_PRICE_PLUS || null;
    case "question":
      return process.env.STRIPE_PRICE_QUESTION || null;
    case "livechat":
      return process.env.STRIPE_PRICE_LIVECHAT || null;
  }
}

/**
 * Map a Stripe subscription status onto the statuses our public.subscriptions
 * table allows ('active','canceled','past_due','trialing'). The live DB schema
 * can't be changed, so everything else folds into the closest match.
 */
export function mapSubscriptionStatus(
  s: string
): "active" | "canceled" | "past_due" | "trialing" {
  switch (s) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
    case "incomplete":
      return "past_due";
    case "incomplete_expired":
    case "paused":
    default:
      return "canceled";
  }
}

/** Derive our plan slug from a Stripe Price ID. Null when it doesn't match a known price. */
export function planFromPrice(priceId: string | null | undefined): "core" | "plus" | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_CORE) return "core";
  if (priceId === process.env.STRIPE_PRICE_PLUS) return "plus";
  return null;
}
