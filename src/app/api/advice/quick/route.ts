import { NextResponse } from "next/server";
import { getProfile } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const DAILY_CAP = 5;

/**
 * POST /api/advice/quick { question }
 * Quick Advice: Plus members only, max 5 per member per day (UTC).
 * Quick questions are stored in ask_questions with price_cents = 0.
 */
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  if (profile.plan !== "plus") {
    return NextResponse.json(
      { error: "Quick Advice comes with Plus — upgrade and it's yours." },
      { status: 403 }
    );
  }

  const { question } = (await req.json().catch(() => ({}))) as { question?: string };
  const q = String(question ?? "").trim();
  if (!q) return NextResponse.json({ error: "Write the question first." }, { status: 400 });
  if (q.length > 2000) {
    return NextResponse.json({ error: "Keep it to one straightforward question." }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const { count, error: cErr } = await sb
    .from("ask_questions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("price_cents", 0)
    .gte("created_at", dayStart.toISOString());
  if (cErr) {
    console.error("[quick-advice] count failed:", cErr.message);
    return NextResponse.json({ error: "Couldn't check your daily count. Try again." }, { status: 500 });
  }

  const used = count ?? 0;
  if (used >= DAILY_CAP) {
    return NextResponse.json(
      {
        error:
          "That's your 5 Quick Advice questions for today — the cap resets tomorrow. Got something bigger? Drop a $7 thread instead.",
      },
      { status: 429 }
    );
  }

  const { error: iErr } = await sb.from("ask_questions").insert({
    user_id: profile.id,
    question: q,
    price_cents: 0,
    status: "open",
  });
  if (iErr) {
    console.error("[quick-advice] insert failed:", iErr.message);
    return NextResponse.json({ error: "Couldn't send it. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, remaining: DAILY_CAP - used - 1 });
}
