"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import { SectionTitle } from "@/components/ui";

type Mode = "loading" | "request" | "set" | "sent";

export default function ResetPasswordPage() {
  const [mode, setMode] = useState<Mode>("loading");
  const [email, setEmail] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  // On arrival with a recovery code (?code=...) or legacy hash tokens,
  // establish the session, then show the new-password form.
  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg(error.message);
          setMode("request");
          return;
        }
        // clean the code out of the URL
        window.history.replaceState({}, "", window.location.pathname);
      }
      const { data: { user } } = await sb.auth.getUser();
      setMode(user ? "set" : "request");
    })();
  }, []);

  async function requestLink(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { setMsg(error.message); return; }
    setMode("sent");
  }

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (pw1 !== pw2) { setMsg("Passwords don't match."); return; }
    const { error } = await supabaseBrowser().auth.updateUser({ password: pw1 });
    if (error) { setMsg(error.message); return; }
    router.push("/login");
  }

  if (mode === "loading") {
    return (
      <div className="mx-auto max-w-md">
        <SectionTitle>Reset password</SectionTitle>
        <div className="card"><p className="text-sm text-muted">Loading…</p></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <SectionTitle>Reset password</SectionTitle>

      {mode === "sent" ? (
        <div className="card">
          <p className="text-sm">
            If that email has an account, a reset link is on its way.
            Check your inbox (and spam folder).
          </p>
        </div>
      ) : mode === "set" ? (
        <form onSubmit={setNewPassword} className="card space-y-3">
          <p className="text-sm text-muted">Choose a new password for your account.</p>
          <input className="input" placeholder="New password" type="password" value={pw1}
            onChange={(e) => setPw1(e.target.value)} required minLength={8} />
          <input className="input" placeholder="Confirm new password" type="password" value={pw2}
            onChange={(e) => setPw2(e.target.value)} required minLength={8} />
          {msg && <p className="text-sm text-neonCoral">{msg}</p>}
          <button className="btn-neon w-full" type="submit">Set new password</button>
        </form>
      ) : (
        <form onSubmit={requestLink} className="card space-y-3">
          <p className="text-sm text-muted">
            Enter your account email and we’ll send you a reset link.
          </p>
          <input className="input" placeholder="Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          {msg && <p className="text-sm text-neonCoral">{msg}</p>}
          <button className="btn-neon w-full" type="submit">Send reset link</button>
        </form>
      )}
    </div>
  );
}
