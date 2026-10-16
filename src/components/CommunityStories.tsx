"use client";

import { useState } from "react";

export type CommunityStory = {
  id: string;
  title: string | null;
  body: string;
  created_at: string;
  likes: number;
  dislikes: number;
  myVote: "like" | "dislike" | null;
};

export default function CommunityStories({ initial }: { initial: CommunityStory[] }) {
  const [stories, setStories] = useState<CommunityStory[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function vote(storyId: string, v: "like" | "dislike") {
    if (busy) return;
    setBusy(storyId);
    try {
      const res = await fetch("/api/stories/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story_id: storyId, vote: v }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) {
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId
              ? { ...s, likes: j.likes, dislikes: j.dislikes, myVote: j.myVote }
              : s
          )
        );
      }
    } finally {
      setBusy(null);
    }
  }

  if (stories.length === 0) {
    return <p className="text-sm text-muted">No community stories yet. Yours could be the first.</p>;
  }

  return (
    <div className="space-y-4">
      {stories.map((s) => (
        <article key={s.id} className="card">
          {s.title && <h3 className="font-display text-xl text-white">{s.title}</h3>}
          <p className="mt-2 whitespace-pre-wrap text-cream/85">{s.body}</p>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <button
              onClick={() => vote(s.id, "like")}
              disabled={busy === s.id}
              aria-label="Like this story"
              className={`rounded-full px-3 py-1 font-semibold transition disabled:opacity-50 ${
                s.myVote === "like"
                  ? "bg-neonTeal text-ink"
                  : "bg-white/5 text-cream/70 hover:bg-white/10"
              }`}
            >
              👍 {s.likes}
            </button>
            <button
              onClick={() => vote(s.id, "dislike")}
              disabled={busy === s.id}
              aria-label="Dislike this story"
              className={`rounded-full px-3 py-1 font-semibold transition disabled:opacity-50 ${
                s.myVote === "dislike"
                  ? "bg-neonCoral text-ink"
                  : "bg-white/5 text-cream/70 hover:bg-white/10"
              }`}
            >
              👎 {s.dislikes}
            </button>
            <span className="text-xs text-muted">posted anonymously</span>
          </div>
        </article>
      ))}
    </div>
  );
}
