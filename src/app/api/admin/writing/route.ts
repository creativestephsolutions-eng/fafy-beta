import { NextResponse } from "next/server";
import { getProfile } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function requireAdmin() {
  const p = await getProfile();
  return p?.is_admin ? p : null;
}

// Admin-only: publish a Writing post. Body: { title, body, series?, questions: string[] }
export async function POST(req: Request) {
  const p = await requireAdmin();
  if (!p) {
    return NextResponse.json({ ok: false, error: "not authorized" }, { status: 403 });
  }
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }
  const title = String(payload.title || "").trim();
  const body = String(payload.body || "").trim();
  const series = String(payload.series || "").trim();
  const questions = Array.isArray(payload.questions)
    ? payload.questions.map((q: any) => String(q).trim()).filter(Boolean)
    : [];
  if (!title) return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
  if (!body) return NextResponse.json({ ok: false, error: "body is required" }, { status: 400 });
  if (questions.length < 3) {
    return NextResponse.json({ ok: false, error: "at least 3 questions are required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: post, error: postErr } = await sb
    .from("writing_posts")
    .insert({ title, body, series_label: series || null, created_by: p.id })
    .select("id")
    .single();
  if (postErr || !post) {
    return NextResponse.json({ ok: false, error: postErr?.message || "insert failed" }, { status: 500 });
  }
  const { error: qErr } = await sb.from("writing_questions").insert(
    questions.map((q: string, i: number) => ({ post_id: post.id, position: i + 1, body: q }))
  );
  if (qErr) {
    return NextResponse.json({ ok: false, error: qErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: post.id });
}

// Admin-only: delete a Writing post. Body: { id }
export async function DELETE(req: Request) {
  const p = await requireAdmin();
  if (!p) {
    return NextResponse.json({ ok: false, error: "not authorized" }, { status: 403 });
  }
  const payload = await req.json().catch(() => null);
  const id = String(payload?.id || "");
  if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });

  const sb = supabaseAdmin();
  const { error } = await sb.from("writing_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
