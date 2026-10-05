import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { supabaseServer, getProfile } from "@/lib/supabase";
import { SectionTitle, Kicker } from "@/components/ui";

async function answerAsk(form: FormData) {
  "use server";
  const p = await getProfile();
  if (!p?.is_admin) return;
  const sb = supabaseServer();
  await sb.from("ask_questions").update({
    answer: String(form.get("answer")), status: "answered",
    answered_at: new Date().toISOString(),
  }).eq("id", String(form.get("id")));
  revalidatePath("/admin");
}

async function reviewFlag(form: FormData) {
  "use server";
  const p = await getProfile();
  if (!p?.is_admin) return;
  const sb = supabaseServer();
  const id = String(form.get("id"));
  const verdict = String(form.get("verdict")); // kept | removed
  const { data: flag } = await sb.from("shit_flags").select("post_id").eq("id", id).single();
  await sb.from("shit_flags").update({ status: verdict }).eq("id", id);
  if (flag && verdict === "removed") {
    await sb.from("shit_posts").update({ removed: true }).eq("id", flag.post_id);
  }
  revalidatePath("/admin");
}

async function reviewReport(form: FormData) {
  "use server";
  const p = await getProfile();
  if (!p?.is_admin) return;
  const sb = supabaseServer();
  await sb.from("reports").update({
    status: String(form.get("verdict")), // reviewed | dismissed
  }).eq("id", String(form.get("id")));
  revalidatePath("/admin");
}

async function publishPost(form: FormData) {
  "use server";
  const p = await getProfile();
  if (!p?.is_admin) return;
  const sb = supabaseServer();
  const title = String(form.get("title"));
  const body = String(form.get("body"));
  const series = String(form.get("series") || "");
  const qs = String(form.get("questions") || "").split("\n").map((s) => s.trim()).filter(Boolean);
  if (qs.length < 3) return; // every post ships with at least 3 questions
  const { data: post } = await sb.from("writing_posts").insert({
    title, body, series_label: series || null, created_by: p.id,
  }).select().single();
  if (post) {
    await sb.from("writing_questions").insert(
      qs.map((q, i) => ({ post_id: post.id, position: i + 1, body: q }))
    );
  }
  revalidatePath("/admin");
}

async function createSession(form: FormData) {
  "use server";
  const p = await getProfile();
  if (!p?.is_admin) return;
  const sb = supabaseServer();
  await sb.from("live_sessions").insert({
    title: String(form.get("title")),
    starts_at: new Date(String(form.get("starts_at"))).toISOString(),
    seats: parseInt(String(form.get("seats") || "12"), 10),
    created_by: p.id,
  });
  revalidatePath("/admin");
}

async function setPlan(form: FormData) {
  "use server";
  const p = await getProfile();
  if (!p?.is_admin) return;
  const sb = supabaseServer();
  await sb.from("profiles").update({ plan: String(form.get("plan")) }).eq("id", String(form.get("id")));
  revalidatePath("/admin");
}

const TABS = [
  ["flags", "Flags & Reports"],
  ["ask", "Ask Inbox"],
  ["writing", "Write a Post"],
  ["sessions", "Sessions"],
  ["members", "Members"],
  ["ladder", "Friend Log"],
] as const;

export default async function AdminPage({ searchParams }: { searchParams: { tab?: string } }) {
  const p = await getProfile();
  if (!p) redirect("/login");
  if (!p.is_admin) redirect("/");
  const sb = supabaseServer();
  const tab = (searchParams.tab as string) || "flags";

  const [{ data: flags }, { data: reports }, { data: ask }, { data: members }, { data: sessions }, { data: friends }] =
    await Promise.all([
      sb.from("shit_flags").select("*, shit_posts(body, profiles(username))").eq("status", "open").order("created_at", { ascending: false }),
      sb.from("reports").select("*").eq("status", "open").order("created_at", { ascending: false }),
      sb.from("ask_questions").select("*, profiles(username)").eq("status", "open").order("created_at"),
      sb.from("profiles").select("id,username,plan,is_admin,created_at").order("created_at"),
      sb.from("live_sessions").select("*, session_registrations(count)").order("starts_at", { ascending: false }).limit(20),
      sb.from("friend_requests").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

  return (
    <div>
      <Kicker>Founder only</Kicker>
      <SectionTitle>Admin</SectionTitle>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([k, label]) => (
          <Link key={k} href={`/admin?tab=${k}`}
            className={`rounded px-3 py-1.5 text-sm ${tab === k ? "bg-neonTeal text-ink font-bold" : "text-muted hover:text-cream"}`}>
            {label}
          </Link>
        ))}
      </div>

      {tab === "flags" && (
        <div className="space-y-3">
          <h3 className="font-bold text-neonCoral">Shit-Talk flags ({flags?.length ?? 0})</h3>
          {(flags ?? []).map((f: any) => (
            <div key={f.id} className="card">
              <p className="text-sm"><span className="text-muted">Post by @{f.shit_posts?.profiles?.username}:</span> {f.shit_posts?.body}</p>
              {f.note && <p className="mt-1 text-xs text-muted">Flag note: {f.note}</p>}
              <div className="mt-2 flex gap-2">
                <form action={reviewFlag}><input type="hidden" name="id" value={f.id} /><input type="hidden" name="verdict" value="kept" /><button className="btn-ghost text-sm" type="submit">Keep</button></form>
                <form action={reviewFlag}><input type="hidden" name="id" value={f.id} /><input type="hidden" name="verdict" value="removed" /><button className="btn-ghost text-sm border-neonCoral/60 text-neonCoral" type="submit">Remove post</button></form>
              </div>
            </div>
          ))}
          <h3 className="pt-4 font-bold text-neonCoral">Room reports ({reports?.length ?? 0})</h3>
          {(reports ?? []).map((r: any) => (
            <div key={r.id} className="card">
              <p className="text-sm">{r.note}</p>
              <div className="mt-2 flex gap-2">
                <form action={reviewReport}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="verdict" value="reviewed" /><button className="btn-ghost text-sm" type="submit">Mark reviewed</button></form>
                <form action={reviewReport}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="verdict" value="dismissed" /><button className="btn-ghost text-sm" type="submit">Dismiss</button></form>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "ask" && (
        <div className="space-y-3">
          {(ask ?? []).map((q: any) => (
            <div key={q.id} className="card">
              <p className="text-sm"><span className="font-bold text-neonViolet">@{q.profiles?.username}</span>: {q.question}</p>
              <form action={answerAsk} className="mt-2 flex gap-2">
                <input type="hidden" name="id" value={q.id} />
                <input name="answer" className="input" placeholder="Your answer…" required />
                <button className="btn-neon shrink-0" type="submit">Answer</button>
              </form>
            </div>
          ))}
          {(!ask || ask.length === 0) && <p className="text-muted">Inbox empty.</p>}
        </div>
      )}

      {tab === "writing" && (
        <form action={publishPost} className="card max-w-2xl space-y-3">
          <input name="title" className="input" placeholder="Title" required />
          <input name="series" className="input" placeholder="Series label (e.g. Sayings Series · #2)" />
          <textarea name="body" className="input" rows={10} placeholder="Post body…" required />
          <textarea name="questions" className="input" rows={4}
            placeholder={"One question per line — at least 3"} required />
          <button className="btn-neon" type="submit">Publish post</button>
        </form>
      )}

      {tab === "sessions" && (
        <div>
          <form action={createSession} className="card mb-4 flex flex-wrap gap-2">
            <input name="title" className="input !w-64" placeholder="Session title" required />
            <input name="starts_at" type="datetime-local" className="input !w-56" required />
            <input name="seats" type="number" className="input !w-24" placeholder="Seats" defaultValue={12} />
            <button className="btn-neon" type="submit">Create session</button>
          </form>
          <div className="space-y-2">
            {(sessions ?? []).map((s: any) => (
              <div key={s.id} className="card text-sm">
                <span className="font-bold">{s.title}</span> · {new Date(s.starts_at).toLocaleString()} ·
                <span className="text-muted"> {s.session_registrations?.[0]?.count ?? 0}/{s.seats} registered</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="space-y-2">
          {(members ?? []).map((m: any) => (
            <div key={m.id} className="card flex items-center justify-between text-sm">
              <span><span className="font-bold">@{m.username}</span> · {m.plan}{m.is_admin && " · admin"}</span>
              <form action={setPlan} className="flex gap-2">
                <input type="hidden" name="id" value={m.id} />
                <select name="plan" defaultValue={m.plan} className="input !w-28 !py-1.5">
                  <option value="core">core</option>
                  <option value="plus">plus</option>
                </select>
                <button className="btn-ghost !py-1.5 text-sm" type="submit">Set</button>
              </form>
            </div>
          ))}
        </div>
      )}

      {tab === "ladder" && (
        <div className="space-y-2 text-sm">
          {(friends ?? []).map((f: any) => (
            <div key={f.id} className="card">
              {f.from_user} → {f.to_user} · {f.status} · {new Date(f.created_at).toLocaleString()}
            </div>
          ))}
          {(!friends || friends.length === 0) && <p className="text-muted">No friend requests yet.</p>}
        </div>
      )}
    </div>
  );
}
