import Link from "next/link";
import { Kicker, SectionTitle, Divider } from "@/components/ui";

export default function Home() {
  return (
    <div>
      <div className="py-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted">
          F*ck Around &amp; Find Yourself
        </p>
        <h1 className="mt-3 text-6xl font-black tracking-widest text-neonTeal text-glow-teal">
          FAFY
        </h1>
        <p className="mt-4 text-xl text-cream/90">
          No labels here. Underneath, we&rsquo;re all the same.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/plans" className="btn-neon">Join FAFY</Link>
          <Link href="/rooms" className="btn-ghost">See how Rooms work</Link>
        </div>
      </div>

      <Divider />

      <section className="card">
        <Kicker>The Mission</Kicker>
        <SectionTitle>Real conversation, minus the labels</SectionTitle>
        <div className="space-y-4 text-cream/90">
          <p>
            We&rsquo;re here to encourage the kind of conversation that seems to
            have disappeared in a surface level, black and white world — where
            people are pushed into us vs them, reduced to labels, and left
            lonelier instead of connected.
          </p>
          <p>
            Calling someone a label says no more about them than calling them a
            horse would make them a horse. And here&rsquo;s the part nobody wants
            to hear: we&rsquo;re encouraged to think of ourselves — thinking of
            yourself is necessary for survival — but somewhere along the way we
            started thinking <em>selfishly</em> while calling it thinking of
            ourselves. That confusion is an epidemic of loneliness.
          </p>
          <p className="text-lg font-semibold text-neonCoral">
            More to us. More to them. More in connection.
          </p>
          <p>
            The answers you&rsquo;re looking for don&rsquo;t come from other people.
            They come from asking yourself the right questions — and being
            radically honest with yourself when you answer. Nobody knows
            what&rsquo;s best for you better than you. But if you&rsquo;re not
            asking yourself the right questions from an honest view, you&rsquo;ll
            spend your life answering the wrong question.
          </p>
        </div>
      </section>

      <Divider />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Rooms", "/rooms", "Two people. Anonymous. Real questions, answered blind."],
          ["The Writing", "/writing", "Stephanie's posts — each with 3 questions you answer once."],
          ["Coaching", "/coaching", "Ask in Writing, live small-group sessions."],
          ["Commons", "/commons", "The loose hangout between everything else."],
          ["Shit-Talking Room", "/shit-talk", "Let loose. Good place required."],
          ["Plans", "/plans", "Core $9 · Plus $24 · Ask $7"],
        ].map(([t, href, d]) => (
          <Link key={t} href={href} className="card transition hover:border-neonTeal/60">
            <h3 className="font-bold text-neonTeal">{t}</h3>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
