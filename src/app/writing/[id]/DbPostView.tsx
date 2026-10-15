"use client";

import { useState } from "react";
import Link from "next/link";

export default function DbPostView({
  title,
  subtitle,
  body,
  questions,
}: {
  title: string;
  subtitle: string | null;
  body: string;
  questions: string[];
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [open, setOpen] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const answered = Object.keys(answers).length;
  const paragraphs = body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  function submit(i: number) {
    if (!draft.trim()) return;
    setAnswers((a) => ({ ...a, [i]: draft.trim() }));
    setDraft("");
    setOpen(null);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-neonCoral">The Writing</p>
      <h1 className="mb-1 text-4xl font-extrabold tracking-tight text-neonTeal text-glow-teal">
        {title}
      </h1>
      {subtitle && <p className="mb-6 text-sm text-muted">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}

      <div className="card mb-6 space-y-4 text-cream/90">
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <h2 className="mb-1 text-xl font-bold text-cream">Questions for this piece</h2>
      <p className="mb-1 text-sm text-muted">{answered} of {questions.length} answered</p>
      <p className="mb-4 text-sm text-cream/75">
        {questions.length} questions are below. Choose which one to answer first, second, and third. You can
        answer each question once.
      </p>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const done = i in answers;
          return (
            <div key={i} className="card">
              <p className="font-semibold text-cream">{q}</p>
              {done ? (
                <div className="mt-2 border-l-2 border-neonLime/60 pl-3 text-sm text-cream/80">
                  {answers[i]}
                </div>
              ) : open === i ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="input" rows={3} placeholder="Your answer…"
                    value={draft} onChange={(e) => setDraft(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button className="btn-neon !px-4 !py-2 text-sm" onClick={() => submit(i)} disabled={!draft.trim()}>
                      Answer
                    </button>
                    <button className="btn-ghost !px-4 !py-2 text-sm" onClick={() => { setOpen(null); setDraft(""); }}>
                      Never mind
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn-ghost mt-2 !px-4 !py-1.5 text-sm" onClick={() => setOpen(i)}>
                  Answer this one
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <Link href="/advice" className="btn-ghost">Go to Advice</Link>
      </div>
    </div>
  );
}
