import { NextResponse } from "next/server";
import { getProfile } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// GET: the caller's own stories (any status)
export async function GET() {
  const p = await getProfile();
  if (!p) return NextResponse.json({ ok: false, error: "not authorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("user_stories")
    .select("id, title, body, status, created_at, updated_at")
    .eq("author_id", p.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, stories: data ?? [] });
}

// POST: create a story. Body: { title?, body, submit: boolean }
// submit=false -> profile-only ("private"); submit=true -> "pending" for admin approval
export async function POST(req: Request) {
  const p = await getProfile();
  if (!p) return NextResponse.json({ ok: false, error: "not authorized" }, { status: 401 });
  const payload = await req.json().catch(() => null);
  const title = String(payload?.title ?? "").trim().slice(0, 120) || null;
  const body = String(payload?.body ?? "").trim().slice(0, 5000);
  const submit = payload?.submit === true;
  if (!body) return NextResponse.json({ ok: false, error: "story text is required" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data, error } = await sb.from("user_stories")
    .insert({ author_id: p.id, title, body, status: submit ? "pending" : "private" })
    .select("id, status")
    .single();
  if (error || !data) {
    return NextResponse.json({ ok: false, error: error?.message || "insert failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id, status: data.status });
}

// PATCH: edit own story. Body: { id, title?, body }
// Editing an approved or rejected story sends it back to "pending" for re-approval.
export async function PATCH(req: Request) {
  const p = await getProfile();
  if (!p) return NextResponse.json({ ok: false, error: "not authorized" }, { status: 401 });
  const payload = await req.json().catch(() => null);
  const id = String(payload?.id ?? "");
  const title = String(payload?.title ?? "").trim().slice(0, 120) || null;
  const body = String(payload?.body ?? "").trim().slice(0, 5000);
  if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  if (!body) return NextResponse.json({ ok: false, error: "story text is required" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: existing } = await sb.from("user_stories")
    .select("id, status").eq("id", id).eq("author_id", p.id).maybeSingle();
  if (!existing) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  const nextStatus =
    existing.status === "approved" || existing.status === "rejected" ? "pending" : existing.status;
  const { error } = await sb.from("user_stories")
    .update({ title, body, status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: nextStatus });
}

// DELETE: delete own story. Body: { id }
export async function DELETE(req: Request) {
  const p = await getProfile();
  if (!p) return NextResponse.json({ ok: false, error: "not authorized" }, { status: 401 });
  const payload = await req.json().catch(() => null);
  const id = String(payload?.id ?? "");
  if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });

  const sb = supabaseAdmin();
  const { error } = await sb.from("user_stories").delete().eq("id", id).eq("author_id", p.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
