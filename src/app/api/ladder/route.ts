import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

/** Ladder: invite the other room participant to an anonymous 1:1, or accept/decline. */
export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { room_id, invite_id, accept } = await req.json();

  if (invite_id) {
    const { data: inv } = await sb.from("ladder_invites").select("*").eq("id", invite_id).single();
    if (!inv || inv.to_user !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    await sb.from("ladder_invites").update({ status: accept ? "accepted" : "declined" }).eq("id", invite_id);
    if (accept) {
      await sb.from("friend_requests").upsert({ from_user: inv.to_user, to_user: inv.from_user, status: "open" });
    }
    return NextResponse.json({ ok: true });
  }

  const { data: members } = await sb.from("room_members").select("user_id").eq("room_id", room_id);
  const other = (members ?? []).find((m) => m.user_id !== user.id);
  if (!other) return NextResponse.json({ error: "no partner" }, { status: 400 });
  const { error } = await sb.from("ladder_invites").insert({
    room_id, from_user: user.id, to_user: other.user_id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** List my open ladder invites + friend requests (for a future inbox page). */
export async function GET() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: invites } = await sb.from("ladder_invites").select("*").eq("to_user", user.id).eq("status", "open");
  const { data: friends } = await sb.from("friend_requests").select("*").or(`from_user.eq.${user.id},to_user.eq.${user.id}`);
  return NextResponse.json({ invites, friends });
}
