import { NextResponse } from "next/server";
import { getProfile } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Admin-only: review a room report. Body: { id, verdict: "reviewed" | "dismissed" }
export async function POST(req: Request) {
  const p = await getProfile();
  if (!p?.is_admin) {
    return NextResponse.json({ ok: false, error: "not authorized" }, { status: 403 });
  }
  const payload = await req.json().catch(() => null);
  const id = String(payload?.id || "");
  const verdict = String(payload?.verdict || "");
  if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  if (verdict !== "reviewed" && verdict !== "dismissed") {
    return NextResponse.json({ ok: false, error: "verdict must be reviewed or dismissed" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { error } = await sb.from("reports").update({ status: verdict }).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
