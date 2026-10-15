"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnswerAskForm({ id }: { id: string }) {
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/answer-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, answer }),
      });
      const data = await res.json();
      if (data.ok) {
        router.refresh();
      } else {
        setErr(data.error || `Failed (status ${res.status}).`);
      }
    } catch (e: any) {
      setErr(e?.message || "Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-2">
      <div className="flex gap-2">
        <input value={answer} onChange={(e) => setAnswer(e.target.value)} className="input" placeholder="Your answer…" required />
        <button className="btn-neon shrink-0" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Answer"}
        </button>
      </div>
      {err && <p className="mt-1 text-sm text-red-400">{err}</p>}
    </form>
  );
}
