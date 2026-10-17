import { NextResponse } from "next/server";
import { getProfile } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// GET: the caller's invite code, accepted-invite count, and reward state.
export async function GET() {
  const p = await getProfile();
  if (!p) return NextResponse.json({ ok: false, error: "not authorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const { data: me } = await sb.from("profiles")
    .select("invite_code, invite_reward_given").eq("id", p.id).single();
  // Accepted = invitee signed up with my code AND holds an active/trialing subscription.
  const { data: invitees } = await sb.from("profiles").select("id").eq("invited_by", p.id);
  const inviteeIds = (invitees ?? []).map((r: any) => r.id);
  let accepted = 0;
  if (inviteeIds.length > 0) {
    const { data: subs } = await sb.from("subscriptions")
      .select("user_id").in("user_id", inviteeIds).in("status", ["active", "trialing"])
      .not("stripe_subscription_id", "is", null);
    accepted = new Set((subs ?? []).map((s: any) => s.user_id)).size;
  }
  return NextResponse.json({
    ok: true,
    code: me?.invite_code ?? null,
    accepted,
    rewardGiven: me?.invite_reward_given ?? false,
  });
}

// POST: claim a friend's invite code. Body: { code }
// Sets invited_by on the caller. Only works if the caller hasn't already been invited
// and the code belongs to someone else.
export async function POST(req: Request) {
  const p = await getProfile();
  if (!p) return NextResponse.json({ ok: false, error: "not authorized" }, { status: 401 });
  const payload = await req.json().catch(() => null);
  const code = String(payload?.code ?? "").trim().toUpperCase();
  if (!code) return NextResponse.json({ ok: false, error: "code is required" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: me } = await sb.from("profiles")
    .select("id, invited_by").eq("id", p.id).single();
  if (me?.invited_by) {
    return NextResponse.json({ ok: false, error: "an invite code was already used" }, { status: 400 });
  }
  const { data: inviter } = await sb.from("profiles")
    .select("id").eq("invite_code", code).maybeSingle();
  if (!inviter) {
    return NextResponse.json({ ok: false, error: "that invite code isn't valid" }, { status: 404 });
  }
  if (inviter.id === p.id) {
    return NextResponse.json({ ok: false, error: "that's your own code" }, { status: 400 });
  }
  const { error } = await sb.from("profiles").update({ invited_by: inviter.id }).eq("id", p.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
