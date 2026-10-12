"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { CheckoutType } from "@/lib/stripe";

/** Starts a Stripe Checkout Session via /api/checkout. Logged-out users go to /login first. */
export default function CheckoutButton({
  type,
  label,
  className,
}: {
  type: CheckoutType;
  label: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function go() {
    setBusy(true);
    setErr("");
    try {
      const { data } = await supabaseBrowser().auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        setErr(body.error || "Checkout isn't available right now.");
        setBusy(false);
        return;
      }
      window.location.href = body.url;
    } catch {
      setErr("Something hiccuped. Try again.");
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button className={className ?? "btn-neon"} onClick={go} disabled={busy}>
        {busy ? "…" : label}
      </button>
      {err && <span className="text-xs text-neonCoral">{err}</span>}
    </span>
  );
}
