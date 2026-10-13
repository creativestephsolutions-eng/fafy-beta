"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Kicker } from "@/components/ui";

type Msg = { id: string; from_user: string; body: string; created_at: string };

export default function FriendChatPage({ params }: { params: { id: string } }) {
  const friendId = params.id;
  const router = useRouter();
  const [me, setMe] = useState<string | null>(null);
  const [friend, setFriend] = useState<{ username: string; bio: string } | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [denied, setDenied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMe(user.id);
      // Only friends can view
      const { data: fr } = await sb.from("friend_requests").select("id")
        .eq("status", "accepted")
        .or(`and(from_user.eq.${user.id},to_user.eq.${friendId}),and(from_user.eq.${friendId},to_user.eq.${user.id})`)
        .maybeSingle();
      if (!fr) { setDenied(true); return; }
      const { data: prof } = await sb.from("profiles")
        .select("username, bio").eq("id", friendId).single();
      if (prof) setFriend(prof);
      load(sb, user.id);
      const t = setInterval(() => load(sb, user.id), 4000);
      return () => clearInterval(t);
    })();
  }, [friendId]);

  async function load(sb: any, myId: string) {
    const { data } = await sb.from("direct_messages").select("*")
      .or(`and(from_user.eq.${myId},to_user.eq.${friendId}),and(from_user.eq.${friendId},to_user.eq.${myId})`)
      .order("created_at", { ascending: true }).limit(200);
    if (data) { setMsgs(data); setTimeout(() => bottomRef.current?.scrollIntoView(), 50); }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = input.trim();
    if (!body || !me) return;
    setInput("");
    const sb = supabaseBrowser();
    const { error } = await sb.from("direct_messages").insert({ from_user: me, to_user: friendId, body });
    if (!error) load(sb, me);
  }

  if (denied) return (
    <div className="mx-auto max-w-2xl py-10 text-center">
      <p className="text-cream/85">You can only message confirmed friends.</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Kicker>Private chat</Kicker>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-cream">
        {friend?.username ?? "…"}
      </h1>
      {friend?.bio && <p className="mb-4 text-sm text-cream/70">{friend.bio}</p>}
      <div className="card mb-4 max-h-[50vh] space-y-2 overflow-y-auto">
        {msgs.length === 0 && <p className="text-sm text-muted">No messages yet. Say hi.</p>}
        {msgs.map((m) => (
          <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
            m.from_user === me ? "ml-auto bg-neonTeal/20 text-cream" : "bg-white/5 text-cream/90"
          }`}>
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message…" maxLength={2000} />
        <button type="submit" className="btn-neon">Send</button>
      </form>
    </div>
  );
}
