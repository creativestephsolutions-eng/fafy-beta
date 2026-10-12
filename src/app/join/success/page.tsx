import Link from "next/link";
import { Kicker } from "@/components/ui";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "You're in · FAFY",
};

export default async function JoinSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  let headline = "You're in.";
  let detail =
    "Your payment went through. If anything looks off, tell me and I'll sort it out.";
  let cta: { href: string; label: string } = { href: "/room", label: "Meet your first Room" };

  const stripe = getStripe();
  if (stripe && searchParams.session_id) {
    try {
      const s = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      const type = s.metadata?.type;
      if (type === "plus") {
        headline = "Welcome to Plus.";
        detail =
          "Your subscription is active — Rooms, Writing, Commons, the Ladder, and Quick Advice (5 a day) are all yours.";
        cta = { href: "/advice", label: "Ask your first Quick Advice question" };
      } else if (type === "core") {
        headline = "Welcome to Core.";
        detail =
          "Your subscription is active — Rooms, Writing, Commons, and the Ladder are all yours.";
      } else if (type === "question") {
        headline = "Thread paid. Now ask it.";
        detail =
          "Your $7 is covered — drop the question on the Advice page and I'll take it from there on my next message check.";
        cta = { href: "/advice", label: "Drop your question" };
      } else if (type === "livechat") {
        headline = "Appointment paid. Now book it.";
        detail =
          "Your $9 is covered — request your live chat time on the Advice page and I'll confirm on my next message check.";
        cta = { href: "/advice", label: "Request your appointment" };
      }
    } catch {
      // fall through to the generic confirmation
    }
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <Kicker>Payment confirmed</Kicker>
      <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
        <span className="text-neonTeal text-glow-teal">{headline}</span>
      </h1>
      <p className="mb-6 text-cream/85">{detail}</p>
      <div className="flex justify-center gap-3">
        <Link href={cta.href} className="btn-neon">
          {cta.label}
        </Link>
        <Link href="/" className="btn-ghost">
          Home
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted">
        Beta deal still stands: if the first month isn&apos;t for you, tell me what didn&apos;t work
        and I&apos;ll refund it in full. Help me improve.
      </p>
    </div>
  );
}
