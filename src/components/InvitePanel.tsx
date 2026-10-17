"use client";

import { useEffect, useState } from "react";

const TARGET = 5;

export default function InvitePanel() {
  const [data, setData] = useState<{ code: string; accepted: number; rewardGiven: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/invites").then((r) => r.json()).then((j) => {
      if (j?.ok) setData(j);
    }).catch(() => {});
  }, []);

  if (!data?.code) return null;

  const link = `https://fafy.community/signup?ref=${data.code}`;
  const remaining = Math.max(0, TARGET - data.accepted);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }

  return (
    <section className="card mt-6">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-neonLime">Invite friends</p>
      <h2 className="mb-2 text-xl font-extrabold">Bring your people</h2>
      <p className="mb-3 text-sm text-cream/80">
        Share your link — friends get their first Core month for <strong className="text-neonTeal">$7</strong> instead of $9.
        When <strong className="text-neonTeal">5 friends join</strong>, you get a <strong className="text-neonTeal">free month</strong>.
        The Rooms need real people to pair you with — every friend you bring gets us all closer to the good stuff.
      </p>
      <div className="mb-3 flex items-stretch gap-2">
        <input className="input flex-1 font-mono text-sm" readOnly value={link}
          onFocus={(e) => e.target.select()} aria-label="Your invite link" />
        <button type="button" onClick={copy} className="btn-neon shrink-0">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-neonLime transition-all"
            style={{ width: `${Math.min(100, (data.accepted / TARGET) * 100)}%` }} />
        </div>
        <p className="text-sm text-muted whitespace-nowrap">
          {data.rewardGiven
            ? "Free month unlocked!"
            : `${data.accepted}/${TARGET} joined${remaining > 0 ? ` — ${remaining} more for a free month` : ""}`}
        </p>
      </div>
    </section>
  );
}
