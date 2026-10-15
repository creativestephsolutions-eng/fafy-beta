import { NextResponse } from "next/server";
import { getProfile } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only one-time cleanup: for each post title, keep the oldest post and
// delete newer duplicates (questions cascade). Trigger via browser navigation.
export async function GET(_req: Request) {
  const p = await getProfile();
  if (!p?.is_admin) {
    return NextResponse.json({ ok: false, error: "not authorized" }, { status: 403 });
  }
  const sb = supabaseAdmin();
  const { data: posts, error } = await sb
    .from("writing_posts")
    .select("id, title, created_at")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const seen = new Set<string>();
  const toDelete: string[] = [];
  for (const post of posts ?? []) {
    if (seen.has(post.title)) toDelete.push(post.id);
    else seen.add(post.title);
  }
  let deleted = 0;
  for (const id of toDelete) {
    const { error: delErr } = await sb.from("writing_posts").delete().eq("id", id);
    if (!delErr) deleted++;
  }
  return NextResponse.json({ ok: true, deleted, kept: seen.size });
}
