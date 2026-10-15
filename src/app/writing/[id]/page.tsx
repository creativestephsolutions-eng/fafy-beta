import { notFound } from "next/navigation";
import PostView from "./PostView";
import DbPostView from "./DbPostView";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (params.id === "youre-welcome") {
    return { title: "You're Welcome · The Writing · FAFY" };
  }
  const sb = supabaseAdmin();
  const { data: post } = await sb.from("writing_posts").select("title").eq("id", params.id).single();
  return { title: post ? `${post.title} · The Writing · FAFY` : "The Writing · FAFY" };
}

export default async function WritingPostPage({ params }: { params: { id: string } }) {
  if (params.id === "youre-welcome") return <PostView />;

  const sb = supabaseAdmin();
  // DEBUG: list all IDs and compare
  const { data: all } = await sb.from("writing_posts").select("id, title");
  const ids = (all ?? []).map((r) => r.id);
  const match = ids.includes(params.id);
  const { data: posts, error } = await sb.from("writing_posts").select("id, title").eq("id", params.id);
  if (error || !posts || posts.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl text-white">Debug: post not found</h1>
        <p className="text-white/70 mt-2">params.id = {JSON.stringify(params.id)}</p>
        <p className="text-white/70 mt-2">error = {JSON.stringify(error?.message || null)}</p>
        <p className="text-white/70 mt-2">rows = {JSON.stringify(posts?.length ?? null)}</p>
        <p className="text-white/70 mt-2">total in table = {ids.length}</p>
        <p className="text-white/70 mt-2">exact match in list = {JSON.stringify(match)}</p>
        <p className="text-white/70 mt-2 break-all">first id = {JSON.stringify(ids[0] || null)}</p>
      </main>
    );
  }
  const post = posts[0];
  const { data: full } = await sb.from("writing_posts").select("*").eq("id", post.id).single();
  if (!full) notFound();
  const { data: questions } = await sb
    .from("writing_questions")
    .select("body")
    .eq("post_id", post.id)
    .order("position", { ascending: true });

  return (
    <DbPostView
      title={full.title}
      subtitle={full.series_label}
      body={full.body}
      questions={(questions ?? []).map((q) => q.body)}
    />
  );
}
