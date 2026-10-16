import { NextResponse } from "next/server";
import { getProfile } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function requireAdmin() {
  const p = await getProfile();
  return p?.is_admin ? p : null;
}

// Admin-only: list stories by status with author usernames (only the admin ever sees authors).
// GET /api/admin/stories?status=pending|approved|rejected
export async function GET(req: Request) {
  const p = await requireAdmin();
  if (!p) return NextResponse.json({ ok: false, error: "not authorized" }, { status: 403 });
  const status = new URL(req.url).searchParams.get("status") || "pending";
  if (!["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ ok: false, error: "bad status" }, { status: 400 });
  }
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("user_stories")
    .select("id, title, body, status, created_at, profiles!user_stories_author_id_fkey(username)")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, stories: data ?? [] });
}

// Admin-only: approve or reject a story. Body: { id, action: "approve"|"reject" }
export async function POST(req: Request) {
  const p = await requireAdmin();
  if (!p) return NextResponse.json({ ok: false, error: "not authorized" }, { status: 403 });
  const payload = await req.json().catch(() => null);
  const id = String(payload?.id ?? "");
  const action = String(payload?.action ?? "");
  if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ ok: false, error: "action must be approve or reject" }, { status: 400 });
  }
  const sb = supabaseAdmin();
  const { error } = await sb.from("user_stories")
    .update({ status: action === "approve" ? "approved" : "rejected", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: action === "approve" ? "approved" : "rejected" });
}
