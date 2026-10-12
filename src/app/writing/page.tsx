import Link from "next/link";
import { Kicker, Divider } from "@/components/ui";

export const metadata = {
  title: "The Writing · FAFY",
  description: "Things I notice that refuse to mind their business.",
};

const POSTS = [
  {
    slug: "youre-welcome",
    title: "You're Welcome",
    subtitle: "A welcome, without the pressure to impress",
    excerpt:
      "Hey. So for my first piece of Writing, I'm taking the pressure to impress off myself and not doing one…",
  },
];

export default function WritingIndexPage() {
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
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/writing/${p.slug}`} className="card block hover:border-neonTeal/60">
            <h2 className="text-xl font-bold text-neonTeal">{p.title}</h2>
            <p className="text-sm text-neonCoral">{p.subtitle}</p>
            <p className="mt-2 text-sm text-cream/75">{p.excerpt}</p>
          </Link>
        ))}
      </div>
      <Divider />
      <div className="flex flex-wrap gap-3">
        <Link href="/advice" className="btn-ghost">Go to Advice</Link>
      </div>
    </div>
  );
}
