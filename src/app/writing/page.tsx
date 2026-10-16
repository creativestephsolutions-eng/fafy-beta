import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";
import CommunityStories, { type CommunityStory } from "@/components/CommunityStories";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Writing — FAFY",
  description: "Stories and observations. Read them, argue with them, answer the questions.",
};

export default async function WritingIndexPage() {
  const sb = supabaseAdmin();
  // Fetch all and process in JS (avoids stale filtered-query caching)
  const { data: allPosts } = await sb.from("writing_posts").select("*");
  const sorted = (allPosts ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Dedupe by title (keep newest) as a safety net against duplicate publishes
  const seenTitles = new Set<string>();
  const uniquePosts = sorted.filter((p) => {
    if (seenTitles.has(p.title)) return false;
    seenTitles.add(p.title);
    return true;
  });

  // Community stories: members only, anonymous. author_id is never selected.
  const userSb = supabaseServer();
  const { data: { user } } = await userSb.auth.getUser();
  let communityStories: CommunityStory[] = [];
  if (user) {
    const { data: stories } = await sb.from("user_stories")
      .select("id, title, body, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    const ids = (stories ?? []).map((s: any) => s.id);
    let votesByStory: Record<string, { likes: number; dislikes: number }> = {};
    let myVotes: Record<string, "like" | "dislike"> = {};
    if (ids.length > 0) {
      const { data: votes } = await sb.from("story_votes").select("story_id, vote").in("story_id", ids);
      for (const v of votes ?? []) {
        const agg = votesByStory[v.story_id] ?? { likes: 0, dislikes: 0 };
        if (v.vote === "like") agg.likes++;
        else agg.dislikes++;
        votesByStory[v.story_id] = agg;
      }
      const { data: mine } = await sb.from("story_votes")
        .select("story_id, vote").in("story_id", ids).eq("user_id", user.id);
      for (const v of mine ?? []) myVotes[v.story_id] = v.vote;
    }
    communityStories = (stories ?? []).map((s: any) => ({
      id: s.id,
      title: s.title,
      body: s.body,
      created_at: s.created_at,
      likes: votesByStory[s.id]?.likes ?? 0,
      dislikes: votesByStory[s.id]?.dislikes ?? 0,
      myVote: myVotes[s.id] ?? null,
    }));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl text-neonTeal">Writing</h1>
      <p className="mt-2 text-white/70">
        Stories and observations. Read them, argue with them, answer the questions.
      </p>

      <div className="mt-8 space-y-6">
        {uniquePosts.map((p) => (
          <Link key={p.id} href={`/writing/${p.id}`} className="card block hover:border-neonTeal/60 transition">
            {p.series_label && (
              <p className="text-xs uppercase tracking-widest text-neonViolet">{p.series_label}</p>
            )}
            <h2 className="font-display text-2xl text-white mt-1">{p.title}</h2>
            <p className="mt-2 text-white/70 line-clamp-3">{p.body.slice(0, 200)}…</p>
            <p className="mt-3 text-sm text-neonTeal">Read & answer →</p>
          </Link>
        ))}

        <Link href="/writing/youre-welcome" className="card block hover:border-neonTeal/60 transition">
          <h2 className="font-display text-2xl text-white">You&apos;re Welcome</h2>
          <p className="mt-2 text-white/70 line-clamp-3">
            I have no idea what I&apos;m doing here, but I&apos;m doing it anyway. Welcome to the ride…
          </p>
          <p className="mt-3 text-sm text-neonTeal">Read & answer →</p>
        </Link>

        <Link href="/advice" className="card block border-neonCoral/40 hover:border-neonCoral transition">
          <h2 className="font-display text-2xl text-white">Go to Advice</h2>
          <p className="mt-2 text-white/70">
            Got a question? Drop it in Advice and get a brutally honest answer.
          </p>
          <p className="mt-3 text-sm text-neonCoral">Ask →</p>
        </Link>
      </div>

      <div className="mt-12 border-t border-white/10 pt-8">
        <h2 className="font-display text-3xl text-neonViolet">Community Stories</h2>
        <p className="mt-2 text-white/70">
          Stories from members, posted anonymously. Write yours from your profile —
          I read every one before it goes live.
        </p>
        <div className="mt-6">
          {user ? (
            <CommunityStories initial={communityStories} />
          ) : (
            <p className="text-sm text-muted">
              <Link href="/login" className="text-neonTeal hover:underline">Log in</Link>
              {" "}to read community stories.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
