import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Private endpoint for admin actions (plan changes, direct messages).
// Requires ?secret=CRON_SECRET. POST with JSON body:
// { action: "set_plan", username, plan } OR
// { action: "send_dm", from_username, to_username, body }
export async function POST(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sb = supabaseAdmin();
  const { action, username, plan, from_username, to_username, body } = await req.json();

  if (action === "set_plan") {
    const { data: user } = await sb.from("profiles").select("id").eq("username", username).single();
    if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });
    const { error } = await sb.from("profiles").update({ plan }).eq("id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, username, plan });
  }

  if (action === "send_dm") {
    const { data: fromUser } = await sb.from("profiles").select("id").eq("username", from_username).single();
    const { data: toUser } = await sb.from("profiles").select("id").eq("username", to_username).single();
    if (!fromUser || !toUser) return NextResponse.json({ error: "user not found" }, { status: 404 });

    // Ensure they're friends so the DM appears in the inbox
    const { data: existing } = await sb.from("friend_requests").select("id,status")
      .or(`and(from_user.eq.${fromUser.id},to_user.eq.${toUser.id}),and(from_user.eq.${toUser.id},to_user.eq.${fromUser.id})`)
      .limit(1).single();
    if (!existing) {
      await sb.from("friend_requests").insert({
        from_user: fromUser.id, to_user: toUser.id, status: "accepted",
      });
    } else if (existing.status !== "accepted") {
      await sb.from("friend_requests").update({ status: "accepted" }).eq("id", existing.id);
    }

    const { error } = await sb.from("direct_messages").insert({
      from_user: fromUser.id, to_user: toUser.id, body,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
