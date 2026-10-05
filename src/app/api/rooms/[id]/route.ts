import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

async function memberRoom(sb: any, roomId: string, userId: string) {
  const { data } = await sb.from("room_members")
    .select("participant_label").eq("room_id", roomId).eq("user_id", userId).is("left_at", null).single();
  return data;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const membership = await memberRoom(sb, params.id, user.id);
  if (!membership) return NextResponse.json({ error: "not a member" }, { status: 403 });

  const { data: room } = await sb.from("rooms").select("*").eq("id", params.id).single();
  const { data: entries } = await sb.from("room_entries")
    .select("*, resonance(count)").eq("room_id", params.id).order("created_at");

  // blind answers: hide bodies until both participants submitted this round
  const shaped = (entries ?? []).map((e: any) => {
    const bothIn = (entries ?? []).filter(
      (x: any) => x.round === e.round && x.kind === "answer"
    ).length >= 2;
    const mine = e.user_id === user.id;
    const hide = e.kind === "answer" && !e.revealed && !bothIn && !mine;
    return {
      id: e.id, round: e.round, kind: e.kind,
      body: hide ? "…waiting for the other answer…" : e.body,
      hidden: hide,
      participant: e.user_id === user.id ? membership.participant_label : (membership.participant_label === "1" ? "2" : "1"),
      resonance: e.resonance?.[0]?.count ?? 0,
      mine,
      created_at: e.created_at,
    };
  });

  return NextResponse.json({ room, entries: shaped, me: membership.participant_label });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const membership = await memberRoom(sb, params.id, user.id);
  if (!membership) return NextResponse.json({ error: "not a member" }, { status: 403 });

  const { action, body, entry_id } = await req.json();
  const { data: room } = await sb.from("rooms").select("*").eq("id", params.id).single();

  if (action === "entry") {
    const kind = body.kind as "answer" | "question" | "followup";
    // blind answers: revealed=false until both are in
    const revealed = kind !== "answer";
    const { error } = await sb.from("room_entries").insert({
      room_id: params.id, round: room.round, kind, user_id: user.id,
      body: body.text, revealed,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // auto-reveal: if both participants now have answers this round, reveal all
    const { count } = await sb.from("room_entries")
      .select("id", { count: "exact", head: true })
      .eq("room_id", params.id).eq("round", room.round).eq("kind", "answer");
    if ((count ?? 0) >= 2) {
      await sb.from("room_entries").update({ revealed: true })
        .eq("room_id", params.id).eq("round", room.round).eq("kind", "answer");
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "resonate") {
    const { error } = await sb.from("resonance").insert({ entry_id, user_id: user.id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "next-round") {
    if (room.round < 3) return NextResponse.json({ error: "3-round minimum" }, { status: 400 });
    await sb.from("rooms").update({ round: room.round + 1 }).eq("id", params.id);
    return NextResponse.json({ ok: true });
  }

  if (action === "end") {
    await sb.from("rooms").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", params.id);
    return NextResponse.json({ ok: true });
  }

  if (action === "leave") {
    await sb.from("room_members").update({ left_at: new Date().toISOString() })
      .eq("room_id", params.id).eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  }

  if (action === "report") {
    await sb.from("reports").insert({
      room_id: params.id, reporter_user_id: user.id, note: body?.note ?? "room report",
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
