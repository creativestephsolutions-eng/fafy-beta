import Link from "next/link";
import { Kicker } from "@/components/ui";

export const metadata = {
  title: "Checkout · FAFY",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Kicker>Checkout</Kicker>
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight">
        <span className="text-neonTeal text-glow-teal">Checkout</span> is live.
      </h1>
      <div className="card space-y-3 text-sm text-cream/85">
        <p>Two ways in:</p>
        <ul className="space-y-2">
          <li>
            <strong className="text-neonLime">Got a beta invite link from me?</strong> Use it when
            you sign up and you&apos;re in free — no payment, no card.
          </li>
          <li>
            <strong className="text-neonLime">No invite?</strong> Pick a plan or an advice tier and
            pay securely with Stripe. And the beta deal stands: try the first month, and if you
            don&apos;t like it, tell me what didn&apos;t work — full refund. Help me improve.
          </li>
        </ul>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/plans" className="btn-neon">See the plans</Link>
        <Link href="/advice" className="btn-ghost">Advice tiers</Link>
        <Link href="/signup" className="btn-ghost">Sign up with an invite</Link>
      </div>
    </div>
  );
}
