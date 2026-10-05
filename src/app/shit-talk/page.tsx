import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { SectionTitle, Kicker } from "@/components/ui";

const RULES = [
  "1. Everything said here must come from a good place. This rule outranks all others.",
  "2. Poke jabs — never directly insult.",
  "3. Vulgar without being sick. Create fuckery without asking what the actual fuck.",
  "4. No perverted talk. Hard line, no exceptions.",
  "5. Lines differ per person: use common sense.",
  "6. If something feels wrong, flag it for review. Flagging is housekeeping, not snitching — flagged posts go to Stephanie.",
];

async function post(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const body = String(form.get("body") ?? "").trim();
  if (!body) return;
  await sb.from("shit_posts").insert({ user_id: user.id, body });
  revalidatePath("/shit-talk");
}

async function flag(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  await sb.from("shit_flags").insert({
    post_id: String(form.get("post_id")), user_id: user.id,
    note: String(form.get("note") ?? "").trim() || null,
  });
  revalidatePath("/shit-talk");
}

export default async function ShitTalkPage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: posts } = await sb.from("shit_posts")
    .select("*, profiles(username)").eq("removed", false)
    .order("created_at", { ascending: false }).limit(50);

  return (
    <div className="max-w-3xl">
      <Kicker>The pressure valve</Kicker>
      <SectionTitle>The Shit-Talking Room</SectionTitle>
      <div className="card mb-4 border-neonCoral/40">
        <h3 className="font-bold text-neonCoral">House rules — light but real</h3>
        <ul className="mt-2 space-y-1 text-sm text-cream/85">
          {RULES.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </div>

      <form action={post} className="card mb-4 flex gap-2">
        <input name="body" className="input" placeholder="Let it out — from a good place…" required />
        <button className="btn-neon shrink-0" type="submit">Unleash</button>
      </form>

      <div className="space-y-3">
        {(posts ?? []).map((p: any) => (
          <div key={p.id} className="card">
            <p className="text-sm font-bold text-neonViolet">@{p.profiles?.username}</p>
            <p className="mt-1">{p.body}</p>
            <form action={flag} className="mt-2 flex gap-2">
              <input type="hidden" name="post_id" value={p.id} />
              <input name="note" className="input !py-1.5 text-sm" placeholder="Flag note (optional)" />
              <button className="btn-ghost shrink-0 !py-1.5 text-sm border-neonCoral/60 text-neonCoral" type="submit">
                Flag for review
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
