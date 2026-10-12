"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Kicker } from "@/components/ui";

type Stage = "lobby" | "room" | "ended" | "left";
type Phase = "topic" | "reveal" | "p2q" | "userq" | "choice";

interface Msg {
  from: "p1" | "p2";
  text: string;
  landed: boolean;
}

interface Round {
  topic: string;
  p2Answer: string;
  p2Questions: string[];
}

const ROUNDS: Round[] = [
  {
    topic: "When did someone last change your mind about something important — and how?",
    p2Answer:
      "My uncle, two Thanksgivings ago. I was dead set that quitting my warehouse job to do freelance design was financial suicide — I'd rehearsed the whole responsible-adult speech. He listened, then asked what my plan was for still hating my life at fifty. I didn't have one. I put in my notice in January.",
    p2Questions: [
      "What were you holding onto tightest, right before your mind changed — and who or what loosened your grip first?",
      "When it changed, did it happen all at once, or was there a moment you only recognized later as the turning point?",
      "What's different in how you live now, on an ordinary Tuesday, because it changed?",
    ],
  },
  {
    topic: "What's a piece of advice you were given that sounded great — but turned out to be terrible for you?",
    p2Answer:
      "\u201CNever go to bed angry.\u201D Sounds noble. In practice it meant my ex and I would fight until 3 AM saying progressively dumber things we actually meant. We'd have been better off sleeping and apologizing over coffee like functional adults.",
    p2Questions: [
      "What did you believe the advice was protecting you from?",
      "What did it cost you, believing that, for as long as you did?",
      "What do you do now, in the moment where that advice would once have kicked in?",
    ],
  },
  {
    topic: "What's a belief you held at sixteen that turned out to be completely wrong?",
    p2Answer:
      "That adults had it figured out and I was the only one faking it. Then I became an adult and realized everyone is improvising — some people are just louder about it. Honestly it was a relief. Still faking it, but now with confidence.",
    p2Questions: [
      "When did you first catch your sixteen-year-old belief running your life from the back seat — was there a specific moment?",
      "What story do you tell yourself about what asking for help says about you?",
      "When someone asks YOU for help, how does it feel — and why do you think the math runs differently in that direction?",
    ],
  },
  {
    topic: "What's one decision from the past year you're still second-guessing?",
    p2Answer:
      "Moving back to my hometown. Cheaper, closer to family — and somehow lonelier than the city ever was. I keep doing the math on whether comfort was worth the trade. Jury's still out.",
    p2Questions: [
      "When the second-guessing shows up, what does it usually sound like — what's its favorite argument?",
      "What would have to happen for you to finally call this decision settled — is there a finish line, or is it a moving target?",
      "What's the smallest version of the other choice you could still try?",
    ],
  },
  {
    topic: "When did you last ask for help — and what made it hard, or easy, to ask?",
    p2Answer:
      "Last month, when my car died on the highway. Easy, because I had no choice — hard, because I spent the whole tow ride rehearsing how to sound like I wasn't a burden. The driver didn't care. Nobody ever does as much as I think they will.",
    p2Questions: [
      "What made that particular ask easier than the ones you usually dodge?",
      "If you could replay it, what would you do differently — ask sooner, or ask someone else?",
      "What's the smallest ask you could practice on next — the couch-level one you're currently overthinking?",
    ],
  },
];

const P2_REPLIES = [
  "Honestly? I hadn't thought about it that way until you asked. My first instinct is to dodge, which probably tells you everything.",
  "That's the question, isn't it. I think the real answer is less flattering than the one I want to give — so let me sit with the unflattering one for a second.",
  "Short version: I don't know yet. Longer version: I'm starting to suspect the not-knowing is the part I've been avoiding.",
];

const RULES = [
  "Two people. It's just you and one partner — every turn comes back around fast.",
  "Blind answers. Neither answer shows until both are in — then they reveal together.",
  "Take turns being questioned. Participant 2 asks you one question, then up to two follow-ups; then you do the same for them.",
  "Questions only. No rebuttals, no correcting, no debating. Curiosity is the only move.",
  "Resonance is quiet. Tap “this landed” to signal something reached you — no comments, no counts-war.",
  "Three rounds minimum. After round 3, choose together: keep going, or end the conversation.",
  "Anonymous here. Participant numbers only — no usernames, no profiles.",
  "Leave any time. The Leave button ends the room instantly — no minimum rounds, and you can report on the way out.",
];

function useTypingDelay() {
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (fn: () => void, ms = 1400) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };
}

export default function RoomDemo() {
  const [stage, setStage] = useState<Stage>("lobby");
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("topic");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [askCount, setAskCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [report, setReport] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [friendSent, setFriendSent] = useState(false);
  const delay = useTypingDelay();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, typing, phase, stage]);

  const data = ROUNDS[round % ROUNDS.length];

  function reset() {
    setRound(0); setPhase("topic"); setMsgs([]); setDraft("");
    setQIndex(0); setAskCount(0); setTyping(false);
    setReport(""); setReportSent(false); setInviteSent(false); setFriendSent(false);
  }

  function startRoom() { reset(); setStage("room"); }

  function submitAnswer() {
    if (!draft.trim()) return;
    const mine = draft.trim();
    setDraft("");
    setMsgs((m) => [...m, { from: "p1", text: mine, landed: false }]);
    setTyping(true);
    delay(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "p2", text: data.p2Answer, landed: false }]);
      setPhase("reveal");
    });
  }

  function submitReply() {
    if (!draft.trim()) return;
    const mine = draft.trim();
    setDraft("");
    setMsgs((m) => [...m, { from: "p1", text: mine, landed: false }]);
    const next = qIndex + 1;
    if (next < data.p2Questions.length) {
      setTyping(true);
      delay(() => { setTyping(false); setQIndex(next); });
    } else {
      setPhase("userq");
      setAskCount(0);
    }
  }

  function submitQuestion() {
    if (!draft.trim()) return;
    const mine = draft.trim();
    setDraft("");
    const n = askCount;
    setMsgs((m) => [...m, { from: "p1", text: mine, landed: false }]);
    setTyping(true);
    delay(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "p2", text: P2_REPLIES[n % P2_REPLIES.length], landed: false }]);
      setAskCount(n + 1);
    });
  }

  function finishRound() {
    if (round + 1 < 3) {
      setRound(round + 1); setPhase("topic"); setMsgs([]);
      setQIndex(0); setAskCount(0);
    } else {
      setPhase("choice");
    }
  }

  function keepGoing() {
    setRound(round + 1); setPhase("topic"); setMsgs([]);
    setQIndex(0); setAskCount(0);
  }

  function toggleLanded(i: number) {
    setMsgs((m) => m.map((x, j) => (j === i ? { ...x, landed: !x.landed } : x)));
  }

  /* ---------- lobby ---------- */
  if (stage === "lobby") {
    return (
      <div>
        <Kicker>The Room — a live demo</Kicker>
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight">
          <span className="text-neonTeal text-glow-teal">You&apos;ve been matched</span> with exactly one other subscriber.
        </h1>
        <p className="mb-4 max-w-2xl text-cream/85">
          In here there are no usernames — you are Participant 1, and your partner is Participant 2
          (simulated in this demo, in their own voice). Three rounds minimum, then you choose: keep
          going, or end the conversation. And if the match ever feels wrong, the Leave button ends
          the room instantly — it&apos;s yours from the first message.
        </p>
        <div className="card mb-5">
          <h2 className="mb-2 font-bold text-neonViolet">The room rules</h2>
          <ul className="space-y-1.5 text-sm text-cream/80">
            {RULES.map((r) => <li key={r}>· {r}</li>)}
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-neon" onClick={startRoom}>Start a new room</button>
          <Link href="/rooms" className="btn-ghost">Skip the demo — join the real queue</Link>
        </div>
      </div>
    );
  }

  /* ---------- safety screen ---------- */
  if (stage === "left") {
    return (
      <div className="mx-auto max-w-2xl">
        <Kicker>Safety first</Kicker>
        <h1 className="mb-3 text-3xl font-extrabold text-neonCoral text-glow-coral">You&apos;ve left the room. It&apos;s over.</h1>
        <div className="card space-y-3 text-sm text-cream/85">
          <p>
            The conversation ended the moment you tapped Leave. Nothing further will be shared, and
            Participant 2 can&apos;t reach you through it — or anywhere else here. Inside that room
            you were only ever Participant 1: no name, no username, no profile. Leaving early is
            always allowed; the three-round minimum never applies when a match doesn&apos;t feel right.
          </p>
          <p>
            If something in there crossed a line, you can report Participant 2. You were both just
            numbers to each other, but the platform keeps an internal log of every room connection —
            so a report attaches to a real, recorded connection, and a human reviews it.
          </p>
          {reportSent ? (
            <p className="text-neonLime">Thank you — received and logged. In the live platform this goes straight to a human moderator.</p>
          ) : (
            <div className="space-y-2">
              <textarea className="input" rows={3} placeholder="What happened?"
                value={report} onChange={(e) => setReport(e.target.value)} />
              <button className="btn-coral" onClick={() => setReportSent(true)}>Report this person</button>
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-neon" onClick={startRoom}>Return to lobby</button>
          <Link href="/" className="btn-ghost">Back home</Link>
        </div>
      </div>
    );
  }

  /* ---------- ended ---------- */
  if (stage === "ended") {
    return (
      <div className="mx-auto max-w-2xl">
        <Kicker>Room closed</Kicker>
        <h1 className="mb-3 text-3xl font-extrabold text-neonTeal text-glow-teal">The conversation has ended</h1>
        <div className="card mb-4 space-y-3 text-sm text-cream/85">
          <p>
            Two people, three topics, a lot of honest questions. This is where a room normally
            dissolves and both of you return to the pool to be matched again. But if a conversation
            deserves to continue, the Ladder is how it does — safely, and one mutual step at a time.
          </p>
        </div>
        <div className="card mb-4 border-neonViolet/30">
          <h2 className="mb-1 font-bold text-neonViolet">Rung 1 — Continue privately, still anonymous</h2>
          <p className="mb-3 text-sm text-cream/80">
            Invite Participant 2 to a private 1:1 discussion. No usernames are exchanged; you&apos;re
            still Participant 1 and Participant 2 to each other.
          </p>
          {inviteSent ? (
            <p className="text-sm text-neonLime">Invite accepted. You&apos;re now in a private anonymous 1:1.</p>
          ) : (
            <button className="btn-neon !px-4 !py-2 text-sm" onClick={() => setInviteSent(true)}>Send invite</button>
          )}
        </div>
        <div className="card mb-4 border-neonTeal/30">
          <h2 className="mb-1 font-bold text-neonTeal">Rung 2 — Friend request</h2>
          <p className="mb-3 text-sm text-cream/80">
            If private conversation goes well, either person can send a friend request. It takes
            effect only when both accept — and the connection is logged internally by the platform,
            a quiet record that exists purely so everyone stays accountable. In this demo, requests
            are accepted.
          </p>
          {friendSent ? (
            <p className="text-sm text-neonLime">Friend request accepted and logged.</p>
          ) : (
            <button className="btn-neon !px-4 !py-2 text-sm" onClick={() => setFriendSent(true)}>Send friend request</button>
          )}
        </div>
        <div className="card mb-5">
          <h2 className="mb-1 font-bold text-neonCoral">Report a concern about this room</h2>
          {reportSent ? (
            <p className="text-sm text-neonLime">Thank you. In the live platform this goes straight to a human moderator.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted">What happened? Reports go to the platform team; the room transcript is attached automatically.</p>
              <textarea className="input" rows={3} placeholder="Describe the concern…"
                value={report} onChange={(e) => setReport(e.target.value)} />
              <button className="btn-coral" onClick={() => setReportSent(true)}>Send report</button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-neon" onClick={startRoom}>Start a new room</button>
          <Link href="/writing" className="btn-ghost">Visit The Writing</Link>
          <Link href="/rooms" className="btn-ghost">Join the real queue</Link>
        </div>
      </div>
    );
  }

  /* ---------- in room ---------- */
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <Kicker>Room 12 — two participants</Kicker>
          <p className="text-xs text-muted">
            Turn-based · minimum 3 rounds · Round {Math.min(round + 1, 99)} · you can leave at any point, no questions asked
          </p>
        </div>
        <button className="btn-coral !px-4 !py-2 text-sm" onClick={() => setStage("left")}>
          Leave this room
        </button>
      </div>

      <div className="card mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neonViolet">
          Round {round + 1} · Topic
        </p>
        <p className="mt-1 text-lg font-semibold text-cream">“{data.topic}”</p>
      </div>

      <div className="space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === "p1" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%]">
              <p className="mb-0.5 text-[11px] uppercase tracking-widest text-muted">
                {m.from === "p1" ? "Participant 1 (you)" : "Participant 2"}
              </p>
              <div className={m.from === "p1" ? "chat-bubble-p1" : "chat-bubble-p2"}>{m.text}</div>
              <button
                className={`resonance-btn ${m.landed ? "lit" : ""}`}
                onClick={() => toggleLanded(i)}
                title="Tap to signal this landed"
              >
                {m.landed ? "✓ this landed" : "this landed"}
              </button>
            </div>
          </div>
        ))}
        {typing && <p className="text-xs italic text-muted">Participant 2 is typing…</p>}
        <div ref={bottomRef} />
      </div>

      <div className="mt-5">
        {phase === "topic" && !typing && (
          <div className="space-y-2">
            <p className="text-sm text-cream/80">
              Write your answer. Participant 2 has answered — hidden until yours is in.
            </p>
            <textarea className="input" rows={4} placeholder="Your honest answer…"
              value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="btn-neon" onClick={submitAnswer} disabled={!draft.trim()}>
              Submit blind answer
            </button>
          </div>
        )}

        {phase === "reveal" && (
          <div className="space-y-2">
            <p className="text-sm text-cream/80">
              Both answers are in. Now Participant 2 gets to question you — one question, up to two
              follow-ups. Questions only.
            </p>
            <button className="btn-neon" onClick={() => setPhase("p2q")}>Continue</button>
          </div>
        )}

        {phase === "p2q" && !typing && (
          <div className="space-y-2">
            <div className="card border-neonViolet/30">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neonViolet">
                Participant 2 asks {qIndex === 0 ? "(main question)" : `(follow-up ${qIndex})`}
              </p>
              <p className="mt-1 font-semibold text-cream">“{data.p2Questions[qIndex]}”</p>
            </div>
            <textarea className="input" rows={3} placeholder="Your reply…"
              value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="btn-neon" onClick={submitReply} disabled={!draft.trim()}>
              Reply
            </button>
          </div>
        )}

        {phase === "userq" && !typing && (
          <div className="space-y-2">
            <p className="text-sm text-cream/80">
              Your turn. Ask Participant 2 {askCount === 0 ? "one question" : `a follow-up (${askCount}/2 used)`} about their answer.
            </p>
            {askCount < 3 ? (
              <>
                <textarea className="input" rows={3} placeholder="Your question…"
                  value={draft} onChange={(e) => setDraft(e.target.value)} />
                <button className="btn-neon" onClick={submitQuestion} disabled={!draft.trim()}>
                  Ask
                </button>
              </>
            ) : (
              <button className="btn-neon" onClick={finishRound}>Finish round</button>
            )}
          </div>
        )}

        {phase === "choice" && (
          <div className="card space-y-3 text-center">
            <p className="font-semibold text-cream">
              Three rounds done. Keep going with a fresh topic, or end the conversation?
            </p>
            <div className="flex justify-center gap-3">
              <button className="btn-neon" onClick={keepGoing}>Keep going</button>
              <button className="btn-ghost" onClick={() => setStage("ended")}>End conversation</button>
            </div>
          </div>
        )}
      </div>

      <div className="card mt-6">
        <h2 className="mb-2 text-sm font-bold text-neonViolet">The room rules</h2>
        <ul className="space-y-1 text-xs text-cream/70">
          {RULES.map((r) => <li key={r}>· {r}</li>)}
        </ul>
      </div>
    </div>
  );
}
