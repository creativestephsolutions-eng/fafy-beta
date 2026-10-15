"use client";

import { useState } from "react";

export default function SetPlanForm({ id, current }: { id: string; current: string }) {
  const [plan, setPlan] = useState(current);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/set-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, plan }),
      });
      const data = await res.json();
      setMsg(data.ok
        ? { ok: true, text: "Plan updated." }
        : { ok: false, text: data.error || `Failed (status ${res.status}).` });
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message || "Network error." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <select value={plan} onChange={(e) => setPlan(e.target.value)} className="input !w-28 !py-1.5">
        <option value="core">core</option>
        <option value="plus">plus</option>
      </select>
      <button className="btn-ghost !py-1.5 text-sm" type="submit" disabled={busy}>
        {busy ? "…" : "Set"}
      </button>
      {msg && <span className={`text-xs ${msg.ok ? "text-neonTeal" : "text-red-400"}`}>{msg.text}</span>}
    </form>
  );
}
