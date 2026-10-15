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
  const { data: posts } = await sb.from("writing_posts").select("id, title");
  const post = (posts ?? []).find((p) => p.id === params.id);
  return { title: post ? `${post.title} · The Writing · FAFY` : "The Writing · FAFY" };
}

export default async function WritingPostPage({ params }: { params: { id: string } }) {
  if (params.id === "youre-welcome") return <PostView />;

  const sb = supabaseAdmin();
  // Fetch all and find in JS (avoids PostgREST filter caching issues)
  const { data: posts } = await sb.from("writing_posts").select("*");
  const post = (posts ?? []).find((p) => p.id === params.id);
  if (!post) notFound();

  const { data: questions } = await sb
    .from("writing_questions")
    .select("body")
    .eq("post_id", post.id)
    .order("position", { ascending: true });

  return (
    <DbPostView
      title={post.title}
      subtitle={post.series_label}
      body={post.body}
      questions={(questions ?? []).map((q) => q.body)}
    />
  );
}
