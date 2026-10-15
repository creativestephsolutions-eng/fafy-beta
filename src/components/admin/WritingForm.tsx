"use client";

import { useState, useRef } from "react";

export default function WritingForm() {
  const [title, setTitle] = useState("");
  const [series, setSeries] = useState("");
  const [body, setBody] = useState("");
  const [questions, setQuestions] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const submitted = useRef(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted.current) return;
    submitted.current = true;
    setBusy(true);
    setMsg(null);
    try {
      const qs = questions.split("\n").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/admin/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, series, questions: qs }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg({ ok: true, text: "Published! It should show on the Writing page now." });
        setTitle(""); setSeries(""); setBody(""); setQuestions("");
      } else {
        setMsg({ ok: false, text: data.error || `Failed (status ${res.status}).` });
        submitted.current = false;
      }
    } catch (err: any) {
      setMsg({ ok: false, text: err?.message || "Network error." });
      submitted.current = false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Title" required />
      <input value={series} onChange={(e) => setSeries(e.target.value)} className="input" placeholder="Series label (e.g. Sayings Series · #2)" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} className="input" rows={10} placeholder="Post body…" required />
      <textarea value={questions} onChange={(e) => setQuestions(e.target.value)} className="input" rows={4}
        placeholder={"One question per line — at least 3"} required />
      <button className="btn-neon" type="submit" disabled={busy}>
        {busy ? "Publishing…" : "Publish post"}
      </button>
      {msg && (
        <p className={`text-sm ${msg.ok ? "text-neonTeal" : "text-red-400"}`}>{msg.text}</p>
      )}
    </form>
  );
}
