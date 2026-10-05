"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/writing", label: "Writing" },
  { href: "/commons", label: "Commons" },
  { href: "/shit-talk", label: "Shit Talk" },
  { href: "/coaching", label: "Coaching" },
  { href: "/plans", label: "Plans" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-muted/20 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>💀</span>
          <span className="text-xl font-extrabold tracking-widest text-neonTeal text-glow-teal">
            FAFY
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded px-2.5 py-1.5 transition ${
                path === l.href
                  ? "text-neonTeal"
                  : "text-cream/80 hover:text-neonTeal"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="ml-2 rounded px-2.5 py-1.5 text-muted hover:text-cream">
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
