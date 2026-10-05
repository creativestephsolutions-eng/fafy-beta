import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { SectionTitle, Kicker } from "@/components/ui";

const CAP_PER_MONTH = 50;

async function submitAsk(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const question = String(form.get("question") ?? "").trim();
  if (!question) return;
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { count } = await sb.from("ask_questions").select("id", { count: "exact", head: true }).gte("created_at", since.toISOString());
  if ((count ?? 0) >= CAP_PER_MONTH) return; // capped so Stephanie doesn't get buried
  await sb.from("ask_questions").insert({ user_id: user.id, question, price_cents: 700, status: "open" });
  // beta: no real charge. At public launch, $7 is collected here via Stripe.
  revalidatePath("/coaching/ask");
}

export default async function AskPage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: mine } = await sb.from("ask_questions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <Kicker>$7 per question · founding price</Kicker>
      <SectionTitle>Ask in Writing</SectionTitle>
      <form action={submitAsk} className="card mb-6">
        <textarea name="question" className="input" rows={4}
          placeholder="Ask Stephanie one real question…" required />
        <p className="mt-2 text-xs text-muted">
          Beta: submissions are recorded, no card is charged yet. At launch, $7 is
          collected per question; unanswered or declined questions are refunded in full.
        </p>
        <button className="btn-neon mt-3" type="submit">Submit ($7)</button>
      </form>

      <h2 className="mb-2 text-lg font-bold text-neonTeal">Your questions</h2>
      <div className="space-y-3">
        {(mine ?? []).map((q) => (
          <div key={q.id} className="card">
            <p className="text-sm font-semibold">Q: {q.question}</p>
            {q.answer ? (
              <p className="mt-2 text-sm text-cream/85"><span className="text-neonViolet font-bold">Stephanie:</span> {q.answer}</p>
            ) : (
              <p className="mt-2 text-xs text-muted">Waiting on Stephanie…</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
