import { NextResponse } from "next/server";
import { getProfile } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Admin-only: set a member's plan. Body: { id, plan: "core" | "plus" }
export async function POST(req: Request) {
  const p = await getProfile();
  if (!p?.is_admin) {
    return NextResponse.json({ ok: false, error: "not authorized" }, { status: 403 });
  }
  const payload = await req.json().catch(() => null);
  const id = String(payload?.id || "");
  const plan = String(payload?.plan || "");
  if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  if (plan !== "core" && plan !== "plus") {
    return NextResponse.json({ ok: false, error: "plan must be core or plus" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { error } = await sb.from("profiles").update({ plan }).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
