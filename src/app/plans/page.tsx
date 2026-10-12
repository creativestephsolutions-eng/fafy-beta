import Link from "next/link";
import { Kicker, Divider } from "@/components/ui";
import CheckoutButton from "@/components/CheckoutButton";

export const metadata = {
  title: "Plans · FAFY",
  description: "Two plans. No decoder ring required.",
};

const CORE_POINTS = [
  "The Rooms — structured, anonymous, two-person conversation with blind answers and question rounds",
  "The Writing — my observations, Sayings series, discussions, and post questions",
  "The Commons — the loose subscriber-only feed between Rooms",
  "The Ladder — private anonymous invitations and mutual, logged friend connections after a Room",
  "Drop a Question available — $7 per thread; I answer when I check messages twice a day",
  "Live Chat Appointments available — $9 per appointment, one-time",
];

const PLUS_POINTS = [
  "Everything in Core — Rooms, Writing, Commons, and the Ladder",
  "Quick Advice included — one straightforward question, one straightforward answer, no follow-ups",
  "5 quick questions a day — that's the cap for each member, so I don't get buried and the answers stay worth reading",
  "Drop a Question available — the same $7 per thread, answered when I check messages twice a day",
  "Live Chat Appointments available — the same one-time $9 per appointment",
];

export default function PlansPage() {
  return (
    <div>
      <Kicker>Plans</Kicker>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight">
        Two plans. <span className="text-neonTeal text-glow-teal">No decoder ring required.</span>
      </h1>
      <p className="mb-4 max-w-2xl text-cream/85">
        Core gets you into the community. Plus gets you the same community and includes Quick
        Advice: one question, one answer, no follow-ups, up to 5 questions per member per day. Paid
        advice is separate: drop a question for $7 per thread or schedule a live chat appointment for
        a one-time $9.
      </p>

      <div className="card mb-6 border-neonLime/30">
        <h2 className="mb-1 font-bold text-neonLime">The beta deal</h2>
        <p className="text-sm text-cream/80">
          Friends I personally invite to test: use the beta invite link I send you and you get in
          free. No payment. Everyone else: try the paid beta for the first month. If you don&apos;t
          like it, tell me what didn&apos;t work so I can make the site better, and I&apos;ll refund
          that full first month. That&apos;s the deal:{" "}
          <strong>help me improve — full refund.</strong>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Subscription · The community</p>
          <h2 className="mt-1 text-2xl font-bold text-neonTeal">Core</h2>
          <p className="font-neon mt-1 text-4xl text-cream">$9<span className="text-lg text-muted">/month</span></p>
          <p className="mt-3 text-sm text-cream/80">
            The whole FAFY community for people who want real conversation and writing. When you need
            deeper advice, add a $7 thread or a one-time $9 live chat appointment.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-cream/80">
            {CORE_POINTS.map((p) => <li key={p}>· {p}</li>)}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/room" className="btn-ghost !px-4 !py-2 text-sm">Try the Room demo</Link>
            <CheckoutButton type="core" label="Join Core — $9/mo" className="btn-neon !px-4 !py-2 text-sm" />
          </div>
        </div>
        <div className="card border-neonTeal/40">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neonTeal">Subscription · Community + quick advice</p>
          <h2 className="mt-1 text-2xl font-bold text-neonTeal">Plus</h2>
          <p className="font-neon mt-1 text-4xl text-cream">$24<span className="text-lg text-muted">/month</span></p>
          <p className="mt-1 text-sm font-semibold text-neonLime">Quick Advice included</p>
          <p className="mt-3 text-sm text-cream/80">
            For members who want everything in Core plus a straight answer when the question really
            is simple.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-cream/80">
            {PLUS_POINTS.map((p) => <li key={p}>· {p}</li>)}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/advice" className="btn-ghost !px-4 !py-2 text-sm">See how Advice works</Link>
            <CheckoutButton type="plus" label="Join Plus — $24/mo" className="btn-neon !px-4 !py-2 text-sm" />
          </div>
        </div>
      </div>

      <Divider />

      <Kicker>Paid advice — two one-time options</Kicker>
      <p className="mb-4 text-cream/85">
        Both are available to Core and Plus members. Pick the pace that fits the situation.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card border-neonViolet/40">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neonViolet">Tier 1</p>
          <h2 className="mt-1 text-xl font-bold text-cream">Drop a Question — $7 per thread</h2>
          <p className="mt-2 text-sm text-cream/80">
            One thread covers your starting question, my follow-ups, your answers, and my real take
            once I have enough context. I check messages twice a day, so replies come on that
            schedule — not instantly.
          </p>
        </div>
        <div className="card border-neonTeal/40">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neonTeal">Tier 2</p>
          <h2 className="mt-1 text-xl font-bold text-cream">Live Chat — $9 per appointment</h2>
          <p className="mt-2 text-sm text-cream/80">
            Schedule a time and talk it through with me live. It is a one-time $9 appointment, not a
            subscription and not a change to your plan.
          </p>
        </div>
      </div>

      <div className="card mt-4">
        <p className="text-sm text-cream/80">
          <strong className="text-cream">Quick compare:</strong> Core ($9/mo) = Rooms, Writing,
          Commons, and the Ladder. Plus ($24/mo) = everything in Core plus Quick Advice: one
          question, one answer, no follow-ups, capped at 5 questions per member per day. Drop a
          Question = $7 per thread with twice-daily message checks. Live Chat = one-time $9 per
          scheduled appointment.
        </p>
        <p className="mt-2 text-xs text-muted">
          Beta note: checkout is live — or join with a beta invite link and it&apos;s free during
          the beta.
        </p>
      </div>
    </div>
  );
}
