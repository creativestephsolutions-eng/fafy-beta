"use client";

import { useState } from "react";
import { SectionTitle } from "@/components/ui";

export default function CheckoutPage() {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function confirm() {
    setErr("");
    const res = await fetch("/api/checkout", { method: "POST" });
    const j = await res.json();
    if (!res.ok) { setErr(j.error ?? "Checkout failed"); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md text-center">
        <SectionTitle>You&rsquo;re in.</SectionTitle>
        <p className="text-muted">Your subscription is recorded. Welcome to FAFY.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <SectionTitle>Checkout</SectionTitle>
      <div className="card space-y-3">
        <p className="text-sm text-muted">
          Beta mode: your plan is recorded and activated in-app. When this site
          goes public with real Stripe keys installed, checkout moves real
          money — nothing here charges a card in beta.
        </p>
        {err && <p className="text-sm text-neonCoral">{err}</p>}
        <button className="btn-neon w-full" onClick={confirm}>Activate my plan</button>
      </div>
    </div>
  );
}
