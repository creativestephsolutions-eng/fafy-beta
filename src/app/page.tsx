import Link from "next/link";
import Calavera from "@/components/Calavera";
import { Kicker, Divider, StepCard } from "@/components/ui";

const CORE = [
  {
    n: "01",
    role: "The Rooms",
    title: "The Rooms",
    body: "One subscriber paired with exactly one other, matched at random. One topic at a time: both answer blind (neither answer shows until both are in), then you take turns being questioned — one question, up to two follow-ups, each answered. Minimum three rounds; after that, the pair decides whether to keep going or end well. Anonymous by design — inside a room you are only Participant 1 or Participant 2 — and a “Leave this room” door is open from the first message.",
    cta: "Try the demo",
    href: "/room",
  },
  {
    n: "02",
    role: "Observations with teeth",
    title: "The Writing",
    body: "My day-to-day observations, the Sayings series, and whatever ordinary nonsense refuses to leave me alone. Funny, blunt, and built to make you notice the question hiding under the thing you're complaining about.",
    cta: "Visit The Writing",
    href: "/writing",
  },
  {
    n: "03",
    role: "Your question, my take",
    title: "Advice",
    body: "Drop a question for a $7 thread and I'll answer when I check messages twice a day, or schedule a $9 live chat appointment and talk it through with me in real time. No pretending one answer fits every life.",
    cta: "Ask for advice",
    href: "/advice",
  },
  {
    n: "04",
    role: "Subscriber-only",
    title: "The Commons",
    body: "The place for follow-ups, stray thoughts, small talk, and the comeback your brain delivered three days late. No rounds and no performance required. Usernames are on here; Participant numbers stay inside the Rooms where they belong.",
    cta: "Visit the Commons",
    href: "/commons",
  },
  {
    n: "05",
    role: "How connections deepen",
    title: "The Ladder",
    body: "Friendship is allowed to grow here — one mutual, logged step at a time. After a room: invite a participant to a private 1:1 that stays anonymous, then, if both people choose, send a friend request. Every connection is recorded internally so the platform can keep people accountable.",
    cta: "See it at the end of the demo",
    href: "/room",
  },
  {
    n: "06",
    role: "Membership",
    title: "Plans",
    body: "Core ($9/mo) opens the Rooms, Writing, Commons, and the Ladder. Plus ($24/mo) adds Quick Advice: one question, one answer, no follow-ups, with a cap of 5 questions per member per day. Any member can also drop a question for $7 per thread or schedule a live chat appointment for a one-time $9. During beta, friends I personally invite with a test link get in free. Paid beta members can get their full first month refunded if they tell me what didn't work.",
    cta: "View plans",
    href: "/plans",
  },
];

const STEPS = [
  {
    n: "Step 1",
    title: "One topic question",
    body: "Each round opens with a single reflective question — often seeded by the founder's latest piece of writing. A room runs at least three rounds, so you'll work through at least three topics together.",
  },
  {
    n: "Step 2",
    title: "Both answer blind",
    body: "You each write your answer without seeing the other's. Until yours is in, all you see is “Participant 2 has answered — hidden until yours is in.” Then both answers reveal together. No copying, no performing, no anchoring on the first voice — there isn't one.",
  },
  {
    n: "Step 3",
    title: "Participant 2 questions you",
    body: "One question about your answer — you reply — then up to two follow-ups, each answered in turn. Questions only: no rebuttals, no correcting, no debating. The only move allowed is curiosity.",
  },
  {
    n: "Step 4",
    title: "Then you question them",
    body: "The roles swap. You ask Participant 2 one question, plus up to two follow-ups, and they answer each. All the while, either of you can quietly tap “this landed” on an answer or a reply — a resonance mark. No comments, no scoreboard; people feel heard without the structure breaking.",
  },
  {
    n: "Step 5",
    title: "Three rounds, then a choice",
    body: "After round 3, the room pauses and asks: keep going, or end the conversation? Keeping going deals a fresh topic for another round. Ending well leads to the close-out — and the Ladder, if the conversation deserves one.",
  },
  {
    n: "Step 6",
    title: "The safety valve",
    body: "With two people there's no crowd to buffer a bad match, so the exit is always in reach: Leave this room works from the first message, no minimum rounds, no questions asked. Leaving ends the room on the spot; you were only ever a participant number, and you can report the other person on your way out — the platform logs every room connection internally for exactly that.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="py-10 text-center">
        <div className="mb-4 flex justify-center">
          <Calavera className="h-28 w-28" />
        </div>
        <p className="font-neon text-xl tracking-[0.3em] text-neonViolet text-glow-violet">FAFY</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          Brutally honest advice. <span className="text-neonTeal text-glow-teal">Better questions.</span>{" "}
          Less bullshit.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-cream/85">
          FAFY is where real-life mess gets a straight answer, a smart-ass reality check, and the
          question you probably should&apos;ve asked first. Read my take, argue with yourself a
          little, then test your thinking in a one-on-one anonymous Room.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-cream/85">
          All shit-talking aside, it&apos;s rare to have a productive conversation anymore. EVERYTHING
          has become superficial and self-centered, and having to shrink myself to fit that every
          day is far worse than loneliness. I hope I&apos;ve created a space that encourages everyone
          to finally get to be themselves, be heard for who they really are, and make friends they
          normally wouldn&apos;t make.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/advice" className="btn-neon">See the advice</Link>
          <Link href="/room" className="btn-ghost">Enter the demo room</Link>
        </div>
        <blockquote className="mx-auto mt-8 max-w-xl border-l-2 border-neonCoral/60 pl-4 text-left text-sm italic text-cream/75">
          “I&apos;m not here to hand you a pretty answer. I&apos;m here to help you quit bullshitting
          yourself long enough to find the useful one.”
        </blockquote>
        <p className="mt-6 text-sm font-semibold tracking-wide text-neonLime">
          No labels here. Underneath, we&apos;re all the same.
        </p>
      </section>

      <Divider />

      {/* MISSION */}
      <section className="py-6">
        <Kicker>The Mission</Kicker>
        <div className="card space-y-4 text-cream/85">
          <p>
            The world has become one giant argument where everybody picks a team, slaps a label on
            the other side, and acts like yelling louder counts as thinking. It doesn&apos;t.
          </p>
          <p>
            Republican, Democrat, Christian, atheist, gay, straight — none of that tells you the
            whole person. Calling somebody a label says about as much as calling them a horse. They
            do not magically grow hooves.
          </p>
          <p>
            FAFY exists for the part underneath all that: honest advice, uncomfortable questions, and
            actual conversation between people who haven&apos;t already decided they know everything.
            I give you my take straight — useful, funny, occasionally a little rude — but you still
            have to decide what fits your life.
          </p>
          <p>
            Thinking of yourself is not the same thing as thinking selfishly. One keeps you alive.
            The other leaves everybody lonely and then acts surprised about it.
          </p>
          <p className="font-semibold text-neonLime">No labels here. Underneath, we&apos;re all the same.</p>
          <p>
            The point isn&apos;t to collect answers from somebody else like they&apos;re fortune cookies.
            It&apos;s to ask yourself the right damn question, answer it honestly, and then do something
            with what you find. Otherwise you&apos;re just confidently solving the wrong problem.
          </p>
        </div>
      </section>

      <Divider />

      {/* CORE */}
      <section className="py-6">
        <Kicker>The core</Kicker>
        <div className="grid gap-4 md:grid-cols-2">
          {CORE.map((c) => (
            <article key={c.n} className="card">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs font-bold text-muted">{c.n}</span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-neonCoral">{c.role}</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-neonTeal">{c.title}</h3>
              <p className="mb-4 text-sm text-cream/80">{c.body}</p>
              <Link href={c.href} className="btn-ghost !px-4 !py-2 text-sm">{c.cta}</Link>
            </article>
          ))}
        </div>
      </section>

      <Divider />

      {/* HOW A ROOM WORKS */}
      <section className="py-6">
        <Kicker>How a room works</Kicker>
        <p className="mb-5 max-w-3xl text-cream/85">
          Two people, one topic at a time, nobody waiting on a crowd. The structure is deliberately
          simple so the rules can do the heavy lifting — with only two of you, every turn comes back
          around fast, and the depth goes where the pace used to leak away.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {STEPS.map((s) => (
            <StepCard key={s.n} n={s.n} title={s.title}>{s.body}</StepCard>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted">
          The rules that make it work: blind until both answers are in · take turns being questioned
          — one question, up to two follow-ups · questions only · resonance is silent — no counts, no
          pile-ons · anonymous inside the room — you&apos;re a participant number, not a profile ·
          three rounds minimum — unless you need to leave, which is always allowed.
        </p>
        <div className="mt-4">
          <Link href="/room" className="btn-neon">Try the demo room</Link>
        </div>
      </section>

      <Divider />

      {/* PLANS TEASER */}
      <section className="py-6 text-center">
        <Kicker>Two plans. No decoder ring required.</Kicker>
        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          <div className="card">
            <h3 className="text-xl font-bold text-neonTeal">Core</h3>
            <p className="font-neon mt-1 text-3xl text-cream">$9<span className="text-base text-muted">/mo</span></p>
            <p className="mt-2 text-sm text-cream/80">Rooms, Writing, Commons, and the Ladder.</p>
          </div>
          <div className="card border-neonTeal/40">
            <h3 className="text-xl font-bold text-neonTeal">Plus</h3>
            <p className="font-neon mt-1 text-3xl text-cream">$24<span className="text-base text-muted">/mo</span></p>
            <p className="mt-2 text-sm text-cream/80">Everything in Core, plus Quick Advice included.</p>
          </div>
        </div>
        <div className="card mx-auto mt-4 max-w-3xl border-neonLime/30 text-left">
          <h3 className="mb-1 font-bold text-neonLime">The beta deal</h3>
          <p className="text-sm text-cream/80">
            Friends I personally invite to test: use the beta invite link I send you and you get in
            free. No payment. Everyone else: try the paid beta for the first month. If you
            don&apos;t like it, tell me what didn&apos;t work so I can make the site better, and
            I&apos;ll refund that full first month. That&apos;s the deal:{" "}
            <strong>help me improve — full refund.</strong>
          </p>
        </div>
        <div className="mt-5">
          <Link href="/plans" className="btn-neon">View plans</Link>
        </div>
      </section>
    </div>
  );
}
