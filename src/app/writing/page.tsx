import Link from "next/link";
import { Kicker, Divider } from "@/components/ui";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = {
  title: "The Writing · FAFY",
  description: "Things I notice that refuse to mind their business.",
};

export const dynamic = "force-dynamic";

export default async function WritingIndexPage() {
  const sb = supabaseAdmin();
  const { data: posts } = await sb
    .from("writing_posts")
    .select("id, title, body, series_label, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <Kicker>The Writing</Kicker>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight">
        <span className="text-neonTeal text-glow-teal">Things I notice</span> that refuse to mind their business
      </h1>
      <p className="mb-6 max-w-2xl text-cream/85">
        I&apos;m Stephanie. This is where my day-to-day observations, the Sayings series, and the
        random little pieces of life that won&apos;t leave me alone will land. Expect blunt honesty,
        smart-ass commentary, and at least one question that makes you realize you&apos;ve been
        arguing with the wrong part of the problem.
      </p>
      <div className="space-y-4">
        {(posts ?? []).map((p) => (
          <Link key={p.id} href={`/writing/${p.id}`} className="card block hover:border-neonTeal/60">
            <h2 className="text-xl font-bold text-neonTeal">{p.title}</h2>
            {p.series_label && <p className="text-sm text-neonCoral">{p.series_label}</p>}
            <p className="mt-2 text-sm text-cream/75">
              {p.body.length > 160 ? p.body.slice(0, 160).trimEnd() + "…" : p.body}
            </p>
          </Link>
        ))}
        <Link href="/writing/youre-welcome" className="card block hover:border-neonTeal/60">
          <h2 className="text-xl font-bold text-neonTeal">You&apos;re Welcome</h2>
          <p className="text-sm text-neonCoral">A welcome, without the pressure to impress</p>
          <p className="mt-2 text-sm text-cream/75">
            Hey. So for my first piece of Writing, I&apos;m taking the pressure to impress off myself and not doing one…
          </p>
        </Link>
      </div>
      <Divider />
      <div className="flex flex-wrap gap-3">
        <Link href="/advice" className="btn-ghost">Go to Advice</Link>
      </div>
    </div>
  );
}
