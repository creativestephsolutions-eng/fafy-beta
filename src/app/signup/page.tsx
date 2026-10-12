"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [plan, setPlan] = useState("core");
  const [invite, setInvite] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const gate = await fetch("/api/beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: invite }),
    });
    if (!gate.ok) { setErr("That invite code isn't valid."); return; }
    const sb = supabaseBrowser();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { username, plan, invite_code: invite } },
    });
    if (error) { setErr(error.message); return; }
    const user = data.user;
    if (!user) { setErr("Check your email to confirm your account."); return; }

    const { count } = await sb.from("profiles").select("id", { count: "exact", head: true });
    const { error: pErr } = await sb.from("profiles").insert({
      id: user.id,
      username,
      plan,
      is_admin: (count ?? 0) === 0,
    });
    if (pErr) { setErr(pErr.message); return; }
    await sb.from("subscriptions").insert({ user_id: user.id, plan, status: "active" });
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-neonCoral">Join the beta</p>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight">
        <span className="text-neonTeal text-glow-teal">Get in.</span>
      </h1>
      <p className="mb-4 text-sm text-cream/80">
        Friends I personally invite test free with a beta invite link — no payment. Everyone else:
        try the first month, and if you don&apos;t like it, tell me what didn&apos;t work for a full
        refund. Help me improve.
      </p>
      <form onSubmit={onSubmit} className="card space-y-3">
        <input className="input" placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        <input className="input" placeholder="Email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" placeholder="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="plan" value="core" checked={plan === "core"}
              onChange={() => setPlan("core")} /> Core $9/mo
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="plan" value="plus" checked={plan === "plus"}
              onChange={() => setPlan("plus")} /> Plus $24/mo
          </label>
        </div>
        <input className="input" placeholder="Beta invite code (gets you in free)" value={invite}
          onChange={(e) => setInvite(e.target.value)} />
        {err && <p className="text-sm text-neonCoral">{err}</p>}
        <button className="btn-neon w-full" type="submit">Create account</button>
        <p className="text-center text-sm text-muted">
          18+ only. By signing up you agree to the <a className="text-neonTeal" href="/legal/terms">Terms</a>.
        </p>
      </form>
    </div>
  );
}
