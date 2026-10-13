"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface Thread {
  id: string;
  question: string;
  answer: string | null;
  price_cents: number;
  status: string;
  created_at: string;
}

export default function AdviceActions() {
  const [userId, setUserId] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [question, setQuestion] = useState("");
  const [quick, setQuick] = useState("");
  const [apptTopic, setApptTopic] = useState("");
  const [apptWhen, setApptWhen] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [msg, setMsg] = useState("");
  const [quickMsg, setQuickMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [quickBusy, setQuickBusy] = useState(false);

  useEffect(() => {
    supabaseBrowser().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setChecked(true);
      if (data.user) {
        loadThreads(data.user.id);
        supabaseBrowser().from("profiles").select("plan,plan_override").eq("id", data.user.id).single()
          .then(({ data: p }) => setPlan(((p as { plan?: string; plan_override?: string } | null)?.plan_override ?? (p as { plan?: string } | null)?.plan) ?? null));
      }
    });
  }, []);

  async function loadThreads(uid: string) {
    const sb = supabaseBrowser();
    const { data } = await sb.from("ask_questions")
      .select("id, question, answer, price_cents, status, created_at")
      .eq("user_id", uid).order("created_at", { ascending: false });
    setThreads((data as Thread[]) ?? []);
  }

  async function submitThread() {
    if (!userId || !question.trim()) return;
    setBusy(true); setMsg("");
    const sb = supabaseBrowser();
    const { error } = await sb.from("ask_questions").insert({
      user_id: userId, question: question.trim(), price_cents: 700, status: "open",
    });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setQuestion("");
    setMsg("Sent. I check messages twice a day — your answer comes on the next check.");
    loadThreads(userId);
  }

  async function submitQuick() {
    if (!userId || !quick.trim()) return;
    setQuickBusy(true); setQuickMsg("");
    try {
      const res = await fetch("/api/advice/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: quick.trim() }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; remaining?: number; error?: string };
      if (!res.ok) { setQuickMsg(body.error || "Couldn't send it."); return; }
      setQuick("");
      setQuickMsg(
        body.remaining && body.remaining > 0
          ? `Sent. ${body.remaining} Quick Advice question${body.remaining === 1 ? "" : "s"} left today.`
          : "Sent. That's your 5 for today — the cap resets tomorrow."
      );
      loadThreads(userId);
    } finally {
      setQuickBusy(false);
    }
  }

  async function submitAppt() {
    if (!userId || !apptTopic.trim() || !apptWhen.trim()) return;
    setBusy(true); setMsg("");
    const sb = supabaseBrowser();
    const { error } = await sb.from("ask_questions").insert({
      user_id: userId,
      question: `[Live Chat Appointment request — preferred time: ${apptWhen.trim()}] ${apptTopic.trim()}`,
      price_cents: 900, status: "open",
    });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setApptTopic(""); setApptWhen("");
    setMsg("Request sent. I'll confirm a time on my next message check.");
    loadThreads(userId);
  }

  if (!checked) return null;

  if (!userId) {
    return (
      <div className="card border-neonTeal/30 text-center">
        <p className="mb-3 text-cream/85">
          Advice is for members. Log in or join the beta to drop a question.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/signup" className="btn-neon">Join the beta</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {msg && <p className="card border-neonLime/40 text-sm text-neonLime">{msg}</p>}

      {plan === "plus" && (
        <div className="card border-neonLime/30">
          <h3 className="mb-1 text-lg font-bold text-neonLime">Quick Advice — included with Plus</h3>
          <p className="mb-3 text-sm text-cream/75">
            One straightforward question, one straightforward answer, no follow-ups. Up to 5 per
            day — that&apos;s the cap.
          </p>
          {quickMsg && <p className="mb-2 text-sm text-neonLime">{quickMsg}</p>}
          <textarea className="input" rows={3}
            placeholder="The simple version of the question…"
            value={quick} onChange={(e) => setQuick(e.target.value)} />
          <button className="btn-neon mt-2" onClick={submitQuick} disabled={quickBusy || !quick.trim()}>
            Ask it
          </button>
        </div>
      )}

      <div className="card border-neonViolet/30">
        <h3 className="mb-1 text-lg font-bold text-neonViolet">Drop a Question — $7 per thread</h3>
        <p className="mb-3 text-sm text-cream/75">
          Paid for your thread with the button above? Drop the question here — it goes straight
          into my inbox and I answer on my twice-daily check.
        </p>
        <textarea className="input" rows={4}
          placeholder="The real question, with the ugly context…"
          value={question} onChange={(e) => setQuestion(e.target.value)} />
        <button className="btn-neon mt-2" onClick={submitThread} disabled={busy || !question.trim()}>
          Send my question
        </button>
      </div>

      <div className="card border-neonTeal/30">
        <h3 className="mb-1 text-lg font-bold text-neonTeal">Request a Live Chat Appointment — $9</h3>
        <p className="mb-3 text-sm text-cream/75">
          Paid with the button above? Tell me what it&apos;s about and when works. I&apos;ll
          confirm a time on my next message check.
        </p>
        <input className="input mb-2" placeholder="What's it about?"
          value={apptTopic} onChange={(e) => setApptTopic(e.target.value)} />
        <input className="input mb-2" placeholder="Preferred days/times"
          value={apptWhen} onChange={(e) => setApptWhen(e.target.value)} />
        <button className="btn-neon mt-1" onClick={submitAppt} disabled={busy || !apptTopic.trim() || !apptWhen.trim()}>
          Request appointment
        </button>
      </div>

      {threads.length > 0 && (
        <div>
          <h3 className="mb-2 font-bold text-cream">Your threads</h3>
          <div className="space-y-3">
            {threads.map((t) => (
              <div key={t.id} className="card">
                <p className="text-xs uppercase tracking-widest text-muted">
                  {t.price_cents === 900 ? "Live chat request" : t.price_cents === 0 ? "Quick Advice" : "Drop a Question"} · {t.status}
                </p>
                <p className="mt-1 text-sm font-semibold text-cream">{t.question}</p>
                {t.answer ? (
                  <p className="mt-2 border-l-2 border-neonTeal/60 pl-3 text-sm text-cream/85">{t.answer}</p>
                ) : (
                  <p className="mt-2 text-xs italic text-muted">Waiting on my next message check…</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
