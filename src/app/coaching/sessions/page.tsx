import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { SectionTitle, Kicker } from "@/components/ui";

async function register(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await sb.from("profiles").select("plan").eq("id", user.id).single();
  if (profile?.plan !== "plus") return; // Plus-only
  await sb.from("session_registrations").insert({
    session_id: String(form.get("session_id")), user_id: user.id,
  });
  revalidatePath("/coaching/sessions");
}

export default async function SessionsPage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await sb.from("profiles").select("plan").eq("id", user.id).single();
  const isPlus = profile?.plan === "plus";

  const { data: sessions } = await sb.from("live_sessions")
    .select("*, session_registrations(count)").gt("starts_at", new Date().toISOString())
    .order("starts_at");

  const now = Date.now();

  return (
    <div>
      <Kicker>Plus members only · limited seats</Kicker>
      <SectionTitle>Live Sessions</SectionTitle>
      {!isPlus && (
        <div className="card mb-4 border-neonViolet/40">
          <p className="text-sm">Live sessions are a Plus perk. <Link className="text-neonTeal" href="/plans">Upgrade to Plus ($24/mo)</Link> to grab a seat.</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {(sessions ?? []).map((s: any) => {
          const seats = s.seats;
          const taken = s.session_registrations?.[0]?.count ?? 0;
          const opensAt = new Date(s.starts_at).getTime() - 24 * 3600 * 1000;
          const open = now >= opensAt;
          const full = taken >= seats;
          return (
            <div key={s.id} className="card">
              <h3 className="font-bold">{s.title}</h3>
              <p className="text-sm text-muted">{new Date(s.starts_at).toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted">{taken}/{seats} seats</p>
              {isPlus && open && !full && (
                <form action={register} className="mt-3">
                  <input type="hidden" name="session_id" value={s.id} />
                  <button className="btn-neon" type="submit">Register</button>
                </form>
              )}
              {isPlus && !open && <p className="mt-3 text-xs text-muted">Registration opens 24h before.</p>}
              {isPlus && open && full && <p className="mt-3 text-xs text-neonCoral">Full.</p>}
            </div>
          );
        })}
        {(!sessions || sessions.length === 0) && (
          <p className="text-muted">No sessions scheduled yet.</p>
        )}
      </div>
    </div>
  );
}
