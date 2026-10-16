"use client";

import { useState } from "react";

export default function StoryReviewButtons({ id, onDone }: { id: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject") {
    if (busy) return;
    if (action === "reject" && !confirm("Reject this story? The author can edit and resubmit.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      <button onClick={() => act("approve")} disabled={busy}
        className="btn-neon disabled:opacity-50">
        {busy ? "…" : "Approve"}
      </button>
      <button onClick={() => act("reject")} disabled={busy}
        className="rounded px-3 py-1.5 text-sm text-neonCoral hover:bg-white/5 disabled:opacity-50">
        Reject
      </button>
    </div>
  );
}
