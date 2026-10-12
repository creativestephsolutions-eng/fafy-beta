import { NextResponse } from "next/server";

/**
 * Beta gate: when BETA_INVITE_CODE is set, signups require it.
 * Called by the signup form before creating the account.
 */
export async function POST(req: Request) {
  const required = process.env.BETA_INVITE_CODE;
  if (!required) return NextResponse.json({ ok: true });
  const { code } = await req.json().catch(() => ({}));
  if (code === required) return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false, error: "Invalid invite code" }, { status: 403 });
}
