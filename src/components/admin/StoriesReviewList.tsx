"use client";

import { useEffect, useState } from "react";
import StoryReviewButtons from "./StoryReviewButtons";

type Story = {
  id: string;
  title: string | null;
  body: string;
  status: string;
  created_at: string;
  profiles: { username: string } | null;
};

const TABS = ["pending", "approved", "rejected"] as const;

export default function StoriesReviewList() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(t: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/stories?status=${t}`);
    const j = await res.json().catch(() => null);
    setStories(j?.ok ? j.stories : []);
    setLoading(false);
  }

  useEffect(() => { load(tab); }, [tab]);

  return (
    <div>
      <p className="mb-3 text-xs text-muted">
        Only you see who wrote what. Approved stories post anonymously in Writing&apos;s
        Community Stories (members only).
      </p>
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded px-3 py-1.5 text-sm capitalize ${tab === t ? "bg-neonTeal text-ink font-bold" : "text-muted hover:text-cream"}`}>
            {t}
          </button>
        ))}
      </div>
      {loading && <p className="text-muted">Loading…</p>}
      {!loading && stories.length === 0 && <p className="text-muted">Nothing here.</p>}
      <div className="space-y-3">
        {stories.map((s) => (
          <div key={s.id} className="card">
            <p className="text-xs uppercase tracking-widest text-muted">
              <span className="font-bold text-neonViolet">@{s.profiles?.username ?? "unknown"}</span>
              {" · "}{new Date(s.created_at).toLocaleString()}
            </p>
            {s.title && <h3 className="mt-1 font-display text-lg text-white">{s.title}</h3>}
            <p className="mt-1 whitespace-pre-wrap text-sm text-cream/90">{s.body}</p>
            {tab === "pending" && (
              <StoryReviewButtons id={s.id} onDone={() => load(tab)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
