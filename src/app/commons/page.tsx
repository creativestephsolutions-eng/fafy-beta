import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { SectionTitle, Kicker } from "@/components/ui";

async function post(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const body = String(form.get("body") ?? "").trim();
  if (!body) return;
  await sb.from("commons_posts").insert({ user_id: user.id, body });
  revalidatePath("/commons");
}

async function comment(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const body = String(form.get("body") ?? "").trim();
  if (!body) return;
  await sb.from("commons_comments").insert({
    post_id: String(form.get("post_id")), user_id: user.id, body,
  });
  revalidatePath("/commons");
}

export default async function CommonsPage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: posts } = await sb.from("commons_posts")
    .select("*, profiles(username), commons_comments(*, profiles(username))")
    .order("created_at", { ascending: false }).limit(30);

  return (
    <div className="max-w-3xl">
      <Kicker>The loose hangout</Kicker>
      <SectionTitle>Commons</SectionTitle>
      <form action={post} className="card mb-4 flex gap-2">
        <input name="body" className="input" placeholder="Say something to the room…" required />
        <button className="btn-neon shrink-0" type="submit">Post</button>
      </form>
      <div className="space-y-3">
        {(posts ?? []).map((p: any) => (
          <div key={p.id} className="card">
            <p className="text-sm font-bold text-neonViolet">@{p.profiles?.username}</p>
            <p className="mt-1">{p.body}</p>
            <div className="mt-2 space-y-1 border-t border-muted/20 pt-2">
              {(p.commons_comments ?? []).map((c: any) => (
                <p key={c.id} className="text-sm text-cream/80">
                  <span className="font-bold text-neonViolet">@{c.profiles?.username}</span> {c.body}
                </p>
              ))}
              <form action={comment} className="flex gap-2 pt-1">
                <input type="hidden" name="post_id" value={p.id} />
                <input name="body" className="input !py-1.5 text-sm" placeholder="Reply…" required />
                <button className="btn-ghost shrink-0 !py-1.5 text-sm" type="submit">Reply</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
