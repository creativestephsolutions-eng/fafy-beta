import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Writing — FAFY",
  description: "Stories and observations. Read them, argue with them, answer the questions.",
};

export default async function WritingIndexPage() {
  const sb = supabaseAdmin();
  const { data: posts } = await sb
    .from("writing_posts")
    .select("id, title, body, series_label, created_at")
    .order("created_at", { ascending: false });

  // Dedupe by title (keep newest) as a safety net against duplicate publishes
  const seenTitles = new Set<string>();
  const uniquePosts = (posts ?? []).filter((p) => {
    if (seenTitles.has(p.title)) return false;
    seenTitles.add(p.title);
    return true;
  });

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
    </main>
  );
}
