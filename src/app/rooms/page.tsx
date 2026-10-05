import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { SectionTitle, Kicker } from "@/components/ui";

const TOPICS = [
  "When did someone last change your mind about something important — and how?",
  "What's a label people put on you that never fit?",
  "When was the last time you were radically honest with yourself — and what happened?",
];

async function joinQueue() {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  await sb.from("room_queue").insert({ user_id: user.id, status: "waiting" });

  // try to match with the earliest other waiting member
  const { data: waiting } = await sb.from("room_queue")
    .select("*").eq("status", "waiting").neq("user_id", user.id)
    .order("created_at").limit(1);
  const other = waiting?.[0];
  if (other) {
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const { data: room } = await sb.from("rooms")
      .insert({ topic_question: topic, status: "active", round: 1 })
      .select().single();
    if (room) {
      await sb.from("room_members").insert([
        { room_id: room.id, user_id: other.user_id, participant_label: "1" },
        { room_id: room.id, user_id: user.id, participant_label: "2" },
      ]);
      await sb.from("room_queue").update({ status: "matched" }).in("id", [other.id]);
      await sb.from("room_queue").delete().eq("user_id", user.id).eq("status", "waiting");
      revalidatePath(`/rooms/${room.id}`);
      redirect(`/rooms/${room.id}`);
    }
  }
  revalidatePath("/rooms");
}

export default async function RoomsPage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await sb.from("room_members")
    .select("room_id, participant_label, rooms(id,topic_question,status,round)")
    .eq("user_id", user.id).is("left_at", null);
  const { data: queued } = await sb.from("room_queue")
    .select("id").eq("user_id", user.id).eq("status", "waiting");

  return (
    <div>
      <Kicker>Anonymous · two people · real questions</Kicker>
      <SectionTitle>Rooms</SectionTitle>
      <p className="mb-4 text-sm text-muted">
        You enter as Participant 1 or 2 — usernames stay hidden. Each round: both
        answer the topic question blind, then take turns asking (one main question
        + up to two follow-ups each). Minimum 3 rounds. Leave anytime to a safety
        screen. After a room ends, the Ladder can take it further.
      </p>

      {queued && queued.length > 0 ? (
        <div className="card"><p className="text-neonTeal">Waiting for a match… refresh this page.</p></div>
      ) : (
        <form action={joinQueue}><button className="btn-neon" type="submit">Join the queue</button></form>
      )}

      <h2 className="mt-8 text-lg font-bold text-neonTeal">Your active rooms</h2>
      <div className="mt-2 space-y-2">
        {(memberships ?? []).map((m: any) => m.rooms?.status === "active" && (
          <Link key={m.room_id} href={`/rooms/${m.room_id}`} className="card block hover:border-neonTeal/60">
            <span className="text-xs text-muted">Round {m.rooms.round} · you are Participant {m.participant_label}</span>
            <p className="font-semibold">{m.rooms.topic_question}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
