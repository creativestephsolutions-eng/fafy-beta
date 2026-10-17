"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    if (error) { setErr(error.message); return; }
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-neonCoral">Welcome back</p>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight">
        <span className="text-neonTeal text-glow-teal">Log in</span>
      </h1>
      <p className="mb-4 text-sm text-cream/80">
        FAFY&apos;s just getting started — some features need more members before they fully switch
        on. Log in, bring your friends, let&apos;s build this thing.
      </p>
      <form onSubmit={onSubmit} className="card space-y-3">
        <input className="input" placeholder="Email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" placeholder="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        {err && <p className="text-sm text-neonCoral">{err}</p>}
        <button className="btn-neon w-full" type="submit">Log in</button>
        <p className="text-center text-sm text-muted">
          <a className="text-neonTeal" href="/reset-password">Forgot your password?</a>
          {" · "}
          <a className="text-neonTeal" href="/signup">Join the beta</a>
        </p>
      </form>
    </div>
  );
}
