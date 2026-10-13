import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Private endpoint for the subscriber-watch cron.
// Requires ?secret=CRON_SECRET (set in Vercel env vars).
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("profiles")
    .select("username,plan,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ members: data ?? [] });
}
