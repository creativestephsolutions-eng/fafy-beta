"use client";

import { useEffect, useState } from "react";

type Story = {
  id: string;
  title: string | null;
  body: string;
  status: "private" | "pending" | "approved" | "rejected";
  created_at: string;
};

const STATUS_LABEL: Record<Story["status"], { text: string; cls: string }> = {
  private: { text: "On your profile", cls: "text-neonTeal" },
  pending: { text: "Waiting for approval", cls: "text-neonViolet" },
  approved: { text: "Live in Community Stories", cls: "text-lime-300" },
  rejected: { text: "Not approved", cls: "text-neonCoral" },
};

export default function StoriesManager() {
  const [stories, setStories] = useState<Story[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submit, setSubmit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Story | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/stories");
    const j = await res.json().catch(() => null);
    if (j?.ok) setStories(j.stories);
  }

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const text = body.trim();
    if (!text) { setError("Write something first."); return; }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        const res = await fetch("/api/stories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, title: title.trim(), body: text }),
        });
        const j = await res.json().catch(() => null);
        if (!j?.ok) throw new Error(j?.error || "Could not save.");
        setEditing(null);
      } else {
        const res = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), body: text, submit }),
        });
        const j = await res.json().catch(() => null);
        if (!j?.ok) throw new Error(j?.error || "Could not save.");
      }
      setTitle("");
      setBody("");
      setSubmit(false);
      await load();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this story?")) return;
    await fetch("/api/stories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  function startEdit(s: Story) {
    setEditing(s);
    setTitle(s.title ?? "");
    setBody(s.body);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mt-10">
      <h2 className="mb-1 text-2xl font-extrabold tracking-tight">
        <span className="text-neonViolet">My</span> stories
      </h2>
      <p className="mb-4 text-sm text-cream/70">
        Your own observations, stories, or messages for others — separate from your bio.
        Keep one on your profile for friends to read, or submit it to Community Stories
        (I approve those before they go live, and they post anonymously).
      </p>

      <form onSubmit={save} className="card space-y-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-cream/80">
            Title <span className="font-normal text-muted">(optional)</span>
          </label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)}
            maxLength={120} placeholder="Give it a name…" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-cream/80">Story</label>
          <textarea className="input min-h-32" value={body} onChange={(e) => setBody(e.target.value)}
            maxLength={5000} placeholder="Tell it like it is…" required />
          <p className="mt-1 text-xs text-muted">{body.length}/5000</p>
        </div>
        {!editing && (
          <div className="space-y-2 text-sm">
            <label className="flex items-start gap-2">
              <input type="radio" name="dest" checked={!submit} onChange={() => setSubmit(false)}
                className="mt-1 accent-teal-300" />
              <span><span className="font-semibold text-cream">Keep on my profile</span>
                <span className="text-muted"> — friends can read it here.</span></span>
            </label>
            <label className="flex items-start gap-2">
              <input type="radio" name="dest" checked={submit} onChange={() => setSubmit(true)}
                className="mt-1 accent-teal-300" />
              <span><span className="font-semibold text-cream">Submit to Community Stories</span>
                <span className="text-muted"> — goes live anonymously after I approve it.</span></span>
            </label>
          </div>
        )}
        {editing && (
          <p className="text-xs text-muted">
            Editing — {editing.status === "approved" || editing.status === "rejected"
              ? "saving sends it back for approval."
              : "saving keeps its current status."}
          </p>
        )}
        {error && <p className="text-sm text-neonCoral">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-neon disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Save changes" : submit ? "Submit for approval" : "Save story"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setTitle(""); setBody(""); }}
              className="rounded px-3 py-1.5 text-sm text-muted hover:text-cream">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {stories.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-start justify-between gap-2">
              <div>
                {s.title && <h3 className="font-display text-lg text-white">{s.title}</h3>}
                <p className={`text-xs font-semibold uppercase tracking-widest ${STATUS_LABEL[s.status].cls}`}>
                  {STATUS_LABEL[s.status].text}
                </p>
              </div>
              <div className="flex shrink-0 gap-2 text-sm">
                <button onClick={() => startEdit(s)} className="text-neonTeal hover:underline">Edit</button>
                <button onClick={() => remove(s.id)} className="text-neonCoral hover:underline">Delete</button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-cream/85">{s.body}</p>
          </div>
        ))}
        {stories.length === 0 && (
          <p className="text-sm text-muted">No stories yet. Write your first one above.</p>
        )}
      </div>
    </div>
  );
}
