import Link from "next/link";
import { SectionTitle, Kicker, Divider } from "@/components/ui";

export default function CoachingPage() {
  return (
    <div className="max-w-3xl">
      <Kicker>Questions over answers</Kicker>
      <SectionTitle>Coaching with Stephanie</SectionTitle>

      <div className="card space-y-4 text-cream/90">
        <p>
          I don&rsquo;t hand you answers. I help you ask yourself the right
          questions — real-world advice with the science behind it, in real-world
          terms you can actually use.
        </p>
        <p>
          I&rsquo;m blunt and to the point, but never to be mean. I care deeply,
          and I show it by wanting the people I work with to live their best
          life. I&rsquo;m analytical with high pattern recognition and I burst
          with empathy — I can make a non-emotional, fact-based decision and
          still hold space for how it feels.
        </p>
        <p>
          I&rsquo;m socially awkward, radically honest, a smartass, and sincere.
          I wasn&rsquo;t given the good sense to be afraid of anything except
          thunder and spiders. I am absolutely NOT religious — but I don&rsquo;t
          judge other people&rsquo;s beliefs within reason. And I will never tell
          you to go looking outside yourself for the answer.
        </p>
        <p>
          A session with me feels like chillin&rsquo; with a friend. Friendly
          crap talk is encouraged. It&rsquo;s also why this whole place is
          called what it&rsquo;s called: Fuck Around &amp; Find Yourself.
        </p>
        <p className="rounded bg-ink p-3 text-sm text-muted">
          Disclaimer: everything I say is advice from my perspective. I&rsquo;m
          not a therapist, doctor, lawyer, or financial advisor. You weigh the
          information and decide for yourself. If you&rsquo;re in crisis, call
          or text <strong>988</strong> (US) or your local emergency services.
        </p>
      </div>

      <Divider />

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/coaching/ask" className="card block hover:border-neonTeal/60">
          <h3 className="font-bold text-neonTeal">Ask in Writing — $7</h3>
          <p className="mt-1 text-sm text-muted">
            Submit a question, get a real written answer. Founding price, capped submissions.
          </p>
        </Link>
        <Link href="/coaching/sessions" className="card block hover:border-neonTeal/60">
          <h3 className="font-bold text-neonTeal">Live Sessions</h3>
          <p className="mt-1 text-sm text-muted">
            Small-group video/audio sessions, Plus members only, seats open ~24h before.
          </p>
        </Link>
      </div>
      <p className="mt-4 text-sm text-muted">
        One-on-one sessions: coming soon, sold as limited drops — never part of a subscription.
      </p>

      <Divider />

      <div className="card">
        <p className="text-xs uppercase tracking-widest text-muted">Sample exchange</p>
        <p className="mt-2 font-semibold text-neonViolet">Nothing is wrong with you — but let&rsquo;s trade the question.</p>
        <p className="mt-2 text-sm text-cream/85">
          What do you think is going to happen if you say no? Seriously — play it
          out. Because you are allowed to say no. To things, to people, to
          anything that drains you. That&rsquo;s not selfish, that&rsquo;s survival.
          And here&rsquo;s a good thing to remember: if somebody has a problem
          with you being reasonable, they are not your friend. Might be worth
          re-examining what they actually offer to earn that title. Friendships
          are reciprocal — people give and they take. Somebody who only takes
          isn&rsquo;t a friend. They&rsquo;re a hindrance with controls to your
          peace of mind.
        </p>
        <p className="mt-2 text-xs text-muted">— Stephanie</p>
      </div>
    </div>
  );
}
