"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportButtons({ id }: { id: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function review(verdict: "reviewed" | "dismissed") {
    setBusy(verdict);
    setErr(null);
    try {
      const res = await fetch("/api/admin/review-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, verdict }),
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
      setBusy(null);
    }
  }

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <button className="btn-ghost text-sm" disabled={!!busy} onClick={() => review("reviewed")}>
          {busy === "reviewed" ? "…" : "Mark reviewed"}
        </button>
        <button className="btn-ghost text-sm" disabled={!!busy} onClick={() => review("dismissed")}>
          {busy === "dismissed" ? "…" : "Dismiss"}
        </button>
      </div>
      {err && <p className="mt-1 text-sm text-red-400">{err}</p>}
    </div>
  );
}
