"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Calavera from "./Calavera";

const LINKS = [
  { href: "/room", label: "The Room" },
  { href: "/writing", label: "Writing" },
  { href: "/advice", label: "Advice" },
  { href: "/commons", label: "Commons" },
  { href: "/plans", label: "Plans" },
];

export default function Nav() {
  const path = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabaseBrowser().auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, [path]);

  return (
    <header className="sticky top-0 z-40 border-b border-muted/20 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2">
          <Calavera className="h-9 w-9" />
          <span className="font-neon text-base tracking-wider text-neonTeal text-glow-teal sm:text-lg">
            Fuck Around &amp; Find Yourself
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded px-2.5 py-1.5 transition ${
                path === l.href || path.startsWith(l.href + "/")
                  ? "text-neonTeal"
                  : "text-cream/80 hover:text-neonTeal"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {loggedIn ? (
            <a href="/logout" className="ml-2 rounded px-2.5 py-1.5 text-muted hover:text-cream">
              Log out
            </a>
          ) : (
            <>
              <Link href="/login" className="ml-2 rounded px-2.5 py-1.5 text-muted hover:text-cream">
                Log in
              </Link>
              <Link href="/signup" className="btn-neon ml-1 !px-4 !py-1.5 text-sm">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
