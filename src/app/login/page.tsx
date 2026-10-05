"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import { SectionTitle } from "@/components/ui";

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
      <SectionTitle>Log in</SectionTitle>
      <form onSubmit={onSubmit} className="card space-y-3">
        <input className="input" placeholder="Email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" placeholder="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        {err && <p className="text-sm text-neonCoral">{err}</p>}
        <button className="btn-neon w-full" type="submit">Log in</button>
        <p className="text-center text-sm text-muted">
          <a className="text-neonTeal" href="/reset-password">Forgot your password?</a>
        </p>
      </form>
    </div>
  );
}
