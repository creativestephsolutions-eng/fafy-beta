import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { SectionTitle, Kicker } from "@/components/ui";

export default async function WritingPage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: posts } = await sb
    .from("writing_posts")
    .select("id,title,series_label,created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <Kicker>Her posts seed the conversation</Kicker>
      <SectionTitle>The Writing</SectionTitle>
      <div className="space-y-3">
        {(posts ?? []).map((p) => (
          <Link key={p.id} href={`/writing/${p.id}`} className="card block transition hover:border-neonTeal/60">
            {p.series_label && (
              <p className="text-xs font-bold uppercase tracking-widest text-neonCoral">{p.series_label}</p>
            )}
            <h3 className="mt-1 text-lg font-bold">{p.title}</h3>
          </Link>
        ))}
        {(!posts || posts.length === 0) && (
          <p className="text-muted">No posts yet. The founder publishes from Admin.</p>
        )}
      </div>
    </div>
  );
}
