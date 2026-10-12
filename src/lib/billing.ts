/**
 * Billing integration points for FAFY.
 *
 * Stripe is NOT wired in this build. When Stripe test mode is configured later,
 * set STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY / STRIPE_WEBHOOK_SECRET
 * and implement the checkout + webhook handlers against these plan definitions.
 */

export const PLANS = {
  core: {
    slug: "core",
    name: "Core",
    priceMonthlyCents: 900,
    blurb: "The whole FAFY community for people who want real conversation and writing.",
  },
  plus: {
    slug: "plus",
    name: "Plus",
    priceMonthlyCents: 2400,
    blurb: "Everything in Core plus Quick Advice: one question, one answer, no follow-ups.",
  },
} as const;

export type PlanSlug = keyof typeof PLANS;

export const ADVICE_PRODUCTS = {
  thread: {
    slug: "drop-a-question",
    name: "Drop a Question",
    priceCents: 700,
    blurb: "One thread: your starting question, my follow-ups, your answers, my real take.",
  },
  liveChat: {
    slug: "live-chat",
    name: "Live Chat Appointment",
    priceCents: 900,
    blurb: "One scheduled live chat appointment. One-time charge, not a subscription.",
  },
} as const;

/** True once Stripe test-mode keys are configured. Checkout stays "coming soon" until then. */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
