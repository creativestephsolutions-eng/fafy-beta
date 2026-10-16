import { NextResponse } from "next/server";
import { getProfile } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// POST: like or dislike an approved community story. Body: { story_id, vote: "like"|"dislike" }
// Tapping the active vote again removes it; tapping the other one switches it.
export async function POST(req: Request) {
  const p = await getProfile();
  if (!p) return NextResponse.json({ ok: false, error: "not authorized" }, { status: 401 });
  const payload = await req.json().catch(() => null);
  const story_id = String(payload?.story_id ?? "");
  const vote = String(payload?.vote ?? "");
  if (!story_id) return NextResponse.json({ ok: false, error: "story_id is required" }, { status: 400 });
  if (vote !== "like" && vote !== "dislike") {
    return NextResponse.json({ ok: false, error: "vote must be like or dislike" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  // Only approved (live community) stories can be voted on
  const { data: story } = await sb.from("user_stories")
    .select("id, status").eq("id", story_id).maybeSingle();
  if (!story || story.status !== "approved") {
    return NextResponse.json({ ok: false, error: "story is not live" }, { status: 404 });
  }

  const { data: existing } = await sb.from("story_votes")
    .select("id, vote").eq("story_id", story_id).eq("user_id", p.id).maybeSingle();

  let myVote: string | null = vote;
  if (existing && existing.vote === vote) {
    // Toggle off
    await sb.from("story_votes").delete().eq("id", existing.id);
    myVote = null;
  } else if (existing) {
    await sb.from("story_votes").update({ vote }).eq("id", existing.id);
  } else {
    await sb.from("story_votes").insert({ story_id, user_id: p.id, vote });
  }

  const { data: votes } = await sb.from("story_votes").select("vote").eq("story_id", story_id);
  const likes = (votes ?? []).filter((v: any) => v.vote === "like").length;
  const dislikes = (votes ?? []).filter((v: any) => v.vote === "dislike").length;
  return NextResponse.json({ ok: true, likes, dislikes, myVote });
}
