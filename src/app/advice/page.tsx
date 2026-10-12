import Link from "next/link";
import { Kicker, Divider, StepCard, AdviceDisclaimer } from "@/components/ui";
import CheckoutButton from "@/components/CheckoutButton";
import AdviceActions from "./AdviceActions";

export const metadata = {
  title: "Advice · FAFY",
  description: "Tell me what's going on. Skip the polished version.",
};

function ThreadBubble({ who, children, color }: { who: string; children: React.ReactNode; color: string }) {
  return (
    <div className="card">
      <p className={`mb-1 text-xs font-bold uppercase tracking-[0.2em] ${color}`}>{who}</p>
      <div className="text-sm text-cream/90">{children}</div>
    </div>
  );
}

export default function AdvicePage() {
  return (
    <div>
      <Kicker>Advice</Kicker>
      <h1 className="mb-3 max-w-2xl text-4xl font-extrabold tracking-tight">
        Tell me what&apos;s going on. <span className="text-neonTeal text-glow-teal">Skip the polished version.</span>
      </h1>
      <p className="mb-4 max-w-2xl text-cream/85">
        Bring me the real question, the ugly context, and the part you keep leaving out because it
        makes you look bad. I&apos;ll give you my honest take — funny when it can be, blunt when it
        needs to be, and useful in the world you actually live in.
      </p>
      <AdviceDisclaimer />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 text-lg font-bold text-neonCoral">Brutally honest, not pointlessly brutal</h2>
          <p className="text-sm text-cream/80">
            What I have is real-world judgment, a brain that notices patterns, and very little
            patience for advice that sounds great until it meets an actual Tuesday. I&apos;ll tell
            you what I see in plain English. If you&apos;re dodging the obvious, I&apos;ll tell you
            that too.
          </p>
        </div>
        <div className="card">
          <h2 className="mb-2 text-lg font-bold text-neonCoral">Questions over answers — with teeth</h2>
          <p className="mb-2 text-sm text-cream/80">
            I won&apos;t pretend my answer is automatically right for your life. Every piece of
            advice comes through the person giving it, including mine. You take the useful parts,
            question the rest, and make your own informed decision. I&apos;m a second set of eyes,
            not a court order.
          </p>
          <p className="text-sm text-cream/80">
            The goal is still questions over answers. The difference is these questions don&apos;t
            arrive wrapped in a soft little wellness blanket. They show up, point at the thing
            you&apos;ve been walking around, and ask why the hell it&apos;s still in the middle of
            the floor.
          </p>
        </div>
      </div>

      <Divider />

      <Kicker>Two ways to get into the real back-and-forth</Kicker>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card border-neonViolet/40">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neonViolet">Tier 1 · Available to Core + Plus</p>
          <h2 className="mt-1 text-2xl font-bold text-cream">Drop a Question</h2>
          <p className="font-neon mt-1 text-xl text-neonViolet">$7 <span className="text-sm text-muted">per thread · one-time</span></p>
          <p className="mt-3 text-sm text-cream/80">
            Send me the real question. I ask the follow-ups I need, you answer them, and then I give
            you my actual take.
          </p>
          <p className="mt-2 text-sm text-cream/80">
            I check these messages twice a day. This is not instant chat. Your answer comes when I
            make my next message check, and the thread moves on that schedule.
          </p>
          <p className="mt-2 text-sm text-cream/80">
            <strong>What “per thread” means:</strong> one starting question + the follow-up questions
            and answers it takes to get enough context. You&apos;re paying $7 for that whole
            back-and-forth, not $7 every time somebody hits reply.
          </p>
          <CheckoutButton type="question" label="Pay $7 & drop your question" className="btn-neon mt-3 !px-4 !py-2 text-sm" />
        </div>
        <div className="card border-neonTeal/40">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neonTeal">Tier 2 · Available to Core + Plus</p>
          <h2 className="mt-1 text-2xl font-bold text-cream">Live Chat Appointment</h2>
          <p className="font-neon mt-1 text-xl text-neonTeal">$9 <span className="text-sm text-muted">per appointment · one-time</span></p>
          <p className="mt-3 text-sm text-cream/80">
            Schedule a time and talk it through with me live instead of waiting for the next message
            check. We handle the back-and-forth in the appointment.
          </p>
          <p className="mt-2 text-sm text-cream/80">
            This is not another subscription: one live chat appointment is one $9 charge. Book one
            when the situation makes more sense in a real-time conversation.
          </p>
          <CheckoutButton type="livechat" label="Pay $9 & book live chat" className="btn-neon mt-3 !px-4 !py-2 text-sm" />
        </div>
      </div>

      <div className="card mt-4 border-neonLime/30">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neonLime">Included with Plus</p>
        <h2 className="mt-1 text-2xl font-bold text-cream">Quick Advice</h2>
        <p className="mt-1 text-sm text-muted">Included with the $24/month Plus membership</p>
        <p className="mt-3 text-sm text-cream/80">
          One straightforward question. One straightforward answer. No follow-ups. Plus members can
          send up to 5 Quick Advice questions per day. If your question needs more digging before I
          can answer it properly, that&apos;s an Advice Thread instead.
        </p>
        <p className="mt-2 text-sm text-cream/80">
          The easy test: if I can answer it without coming back to ask, “Okay, but what happened
          next?” it&apos;s Quick Advice. If not, we&apos;ve got a thread. 5 quick questions a day,
          per member — that&apos;s the cap, so I don&apos;t get buried.
        </p>
      </div>

      <Divider />

      <Kicker>Inside Tier 1 · Drop a Question</Kicker>
      <h2 className="mb-2 text-2xl font-extrabold tracking-tight">
        Your situation. <span className="text-neonTeal text-glow-teal">My follow-ups.</span> Then my take.
      </h2>
      <p className="mb-1 max-w-2xl text-cream/85">
        Give me the question and the context that matters. I&apos;ll ask what I need to ask instead
        of guessing my way through your life, then I&apos;ll give you the blunt, useful answer the
        whole situation deserves.
      </p>
      <p className="mb-5 text-sm text-muted">
        Message schedule: I check twice a day. Drop the question, then go live your life. I will
        answer when I make the next check — not instantly.
      </p>

      <div className="space-y-3">
        <ThreadBubble who="A member starts the thread" color="text-neonViolet">
          “I keep saying yes to things I don&apos;t want to do, then I resent everybody. How do I set
          better boundaries?”
        </ThreadBubble>
        <ThreadBubble who="My follow-up" color="text-neonTeal">
          “Well, have you ever thought about asking yourself what your boundaries actually are? The
          phrase sounds great, but if you&apos;re looking at them rigidly — like, ‘I&apos;m just going
          to learn to say no to people’ — that&apos;s not an answer, is it? You&apos;re not going to
          tell your best friend you can&apos;t take them to the airport for their mother&apos;s
          funeral just because your boundary says you have to say no. So, can you honestly say you
          know what your boundaries are?”
        </ThreadBubble>
        <ThreadBubble who="The member answers" color="text-neonViolet">
          “No. I can&apos;t. I know the word, I&apos;ve read the posts, but if I&apos;m being honest
          my ‘boundaries’ are just whatever I&apos;m too tired or too guilty to deal with that day.
          That&apos;s not a boundary, that&apos;s a mood.”
        </ThreadBubble>
        <ThreadBubble who="My take" color="text-neonTeal">
          “It sounds like your problem is that you don&apos;t really have boundaries, or at least
          aren&apos;t clear on them until you say yes and then get mad at yourself for agreeing to
          something you already knew you didn&apos;t want to do. Take some time to figure out what
          your boundaries actually are. If someone asks you to do something that&apos;s a true
          inconvenience, keeps you from doing what you need to do, or you just flat-out don&apos;t
          want to, politely say no — or maybe fib a bit. Be careful, though: if you say, ‘Sorry, I
          can&apos;t. I&apos;ll be out of town that day,’ and then run into them that day,
          you&apos;ve created hurt feelings, broken trust, and a bunch of other problems. Stay firm
          on the ‘no.’ You&apos;re absolutely allowed to say no, but weigh the factors like you would
          with everything else. Bottom line: be clear on your boundaries. If I want to answer no to
          something, then I need to do so.”
        </ThreadBubble>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StepCard n="Step 1" title="Drop the whole useful truth">
          Start with the question and the context that changes it. Messy is fine. Carefully edited
          nonsense is not helpful.
        </StepCard>
        <StepCard n="Step 2" title="Wait for my message check">
          I check twice a day. I answer then, not the second your message lands, and ask what I need
          instead of guessing from half the story.
        </StepCard>
        <StepCard n="Step 3" title="Get the real answer">
          Answer the follow-ups and I give you my honest read and a practical next move. Then you use
          your own judgment, because advice is information, not permission.
        </StepCard>
      </div>

      <p className="mt-5 text-sm text-cream/80">
        Three clean lanes: Quick Advice is one question and one answer, no follow-ups, included with
        Plus and capped at 5 per member per day. Drop a Question is $7 for the whole thread, with
        replies when I check messages twice a day. A Live Chat Appointment is a one-time $9 when you
        want to schedule the back-and-forth in real time.{" "}
        <Link href="/plans" className="text-neonTeal hover:underline">Compare Core and Plus</Link>
      </p>

      <Divider />

      <Kicker>Get advice now</Kicker>
      <AdviceActions />
    </div>
  );
}
