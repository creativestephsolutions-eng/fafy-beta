"use client";

import { useCallback, useEffect, useState } from "react";

type Entry = {
  id: string; round: number; kind: string; body: string; hidden: boolean;
  participant: string; resonance: number; mine: boolean;
};

export default function RoomView({ roomId }: { roomId: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [round, setRound] = useState(1);
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [kind, setKind] = useState("answer");
  const [left, setLeft] = useState(false);
  const [ended, setEnded] = useState(false);
  const [ladderSent, setLadderSent] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/rooms/${roomId}`);
    if (!res.ok) return;
    const j = await res.json();
    setEntries(j.entries); setRound(j.room.round); setTopic(j.room.topic_question);
    if (j.room.status === "ended") setEnded(true);
  }, [roomId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  async function act(action: string, body?: any, entry_id?: string) {
    await fetch(`/api/rooms/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, body, entry_id }),
    });
    setText("");
    load();
  }

  async function ladder() {
    const res = await fetch("/api/ladder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: roomId }),
    });
    if (res.ok) setLadderSent(true);
  }

  if (left) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <h2 className="text-xl font-bold text-neonTeal">You left the room.</h2>
        <p className="mt-2 text-sm text-muted">
          Nothing more is shared. If something felt wrong, report it — reports go to Stephanie.
        </p>
        <button className="btn-ghost mt-4" onClick={() => act("report", { note: "left-room report" })}>
          Report this room
        </button>
      </div>
    );
  }

  if (ended) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <h2 className="text-xl font-bold text-neonTeal">Room complete.</h2>
        <p className="mt-2 text-sm text-muted">The Ladder: invite them to a still-anonymous 1:1, then a friend request.</p>
        {!ladderSent ? (
          <button className="btn-neon mt-4" onClick={ladder}>Invite to a private 1:1</button>
        ) : (
          <p className="mt-4 text-neonLime">Invite sent. If they accept, a friend request follows.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="card mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">Round {round} (min 3)</p>
          <p className="mt-1 font-semibold">{topic}</p>
        </div>
        <button className="btn-ghost shrink-0 border-neonCoral/60 text-neonCoral" onClick={() => setLeft(true)}>
          Leave this room
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.id} className={`rounded-lg p-3 text-sm ${e.mine ? "bg-ink2 border border-neonTeal/30 ml-8" : "bg-ink2 border border-muted/20 mr-8"}`}>
            <p className="text-xs text-muted">Participant {e.participant} · {e.kind}</p>
            <p className={`mt-1 ${e.hidden ? "italic text-muted" : ""}`}>{e.body}</p>
            {!e.mine && !e.hidden && (
              <button className="mt-1 text-xs text-neonViolet" onClick={() => act("resonate", undefined, e.id)}>
                this landed ({e.resonance})
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="card mt-4">
        <div className="mb-2 flex gap-2 text-sm">
          {(["answer", "question", "followup"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className={`rounded px-2 py-1 ${kind === k ? "bg-neonTeal text-ink" : "text-muted"}`}>
              {k}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input" value={text} onChange={(e) => setText(e.target.value)}
            placeholder={kind === "answer" ? "Your blind answer…" : "Your question…"} />
          <button className="btn-neon shrink-0" onClick={() => act("entry", { kind, text })}>Send</button>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn-ghost" onClick={() => act("next-round")}>Next round</button>
          <button className="btn-ghost" onClick={() => act("end")}>End room</button>
        </div>
      </div>
    </div>
  );
}
