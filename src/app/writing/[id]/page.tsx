import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { SectionTitle } from "@/components/ui";

async function answerQuestion(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const questionId = String(form.get("question_id"));
  const postId = String(form.get("post_id"));
  const body = String(form.get("body") ?? "").trim();
  if (!body) return;
  // unique(question_id, user_id) enforces one answer per member per question
  const { error } = await sb.from("writing_answers").insert({
    question_id: questionId, user_id: user.id, body,
  });
  if (error) console.error("answer rejected:", error.message);
  revalidatePath(`/writing/${postId}`);
}

async function comment(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const postId = String(form.get("post_id"));
  const body = String(form.get("body") ?? "").trim();
  if (!body) return;
  await sb.from("writing_comments").insert({ post_id: postId, user_id: user.id, body });
  revalidatePath(`/writing/${postId}`);
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: post } = await sb.from("writing_posts").select("*").eq("id", params.id).single();
  if (!post) redirect("/writing");
  const { data: questions } = await sb.from("writing_questions")
    .select("*, writing_answers(id,user_id,body)").eq("post_id", params.id).order("position");
  const { data: comments } = await sb.from("writing_comments")
    .select("*, profiles(username)").eq("post_id", params.id).order("created_at");

  return (
    <div className="max-w-3xl">
      {post.series_label && (
        <p className="text-xs font-bold uppercase tracking-widest text-neonCoral">{post.series_label}</p>
      )}
      <SectionTitle>{post.title}</SectionTitle>
      <div className="card whitespace-pre-wrap text-cream/90">{post.body}</div>

      <h2 className="mt-8 text-xl font-bold text-neonTeal">Questions from this post</h2>
      <p className="mb-3 text-sm text-muted">Pick any order. One honest answer per question.</p>
      <div className="space-y-4">
        {(questions ?? []).map((q, i) => {
          const mine = q.writing_answers?.find((a: any) => a.user_id === user.id);
          return (
            <div key={q.id} className="card">
              <p className="font-semibold"><span className="text-neonCoral">{i + 1}.</span> {q.body}</p>
              {mine ? (
                <p className="mt-2 rounded bg-ink p-3 text-sm text-cream/80">
                  ✓ Answered — locked in: <span className="italic">{mine.body}</span>
                </p>
              ) : (
                <form action={answerQuestion} className="mt-2 flex gap-2">
                  <input type="hidden" name="question_id" value={q.id} />
                  <input type="hidden" name="post_id" value={params.id} />
                  <input name="body" className="input" placeholder="Your honest answer…" required />
                  <button className="btn-neon shrink-0" type="submit">Answer</button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="mt-8 text-xl font-bold text-neonTeal">Discussion</h2>
      <div className="mt-2 space-y-2">
        {(comments ?? []).map((c: any) => (
          <div key={c.id} className="rounded bg-ink2 p-3 text-sm">
            <span className="font-bold text-neonViolet">@{c.profiles?.username}</span>
            <p className="mt-1 text-cream/85">{c.body}</p>
          </div>
        ))}
      </div>
      <form action={comment} className="mt-3 flex gap-2">
        <input type="hidden" name="post_id" value={params.id} />
        <input name="body" className="input" placeholder="Join the discussion…" required />
        <button className="btn-neon shrink-0" type="submit">Post</button>
      </form>
    </div>
  );
}
