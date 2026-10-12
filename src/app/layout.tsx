import type { Metadata } from "next";
import { Inter, Monoton } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"] });
const monoton = Monoton({ weight: "400", subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "FAFY — F*ck Around & Find Yourself",
  description:
    "Brutally honest advice. Better questions. Less bullshit. No labels here. Underneath, we're all the same.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${monoton.variable} min-h-screen`}>
        <Nav />
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-6">{children}</main>
        <footer className="border-t border-muted/20 py-8 text-center text-sm text-muted">
          <p className="font-neon mb-2 text-lg tracking-widest text-neonTeal text-glow-teal">FAFY</p>
          <p>F*ck Around &amp; Find Yourself · Operated by CreativeStephSolutions</p>
          <p className="mt-1">fafy.community · creativestephsolutions@gmail.com</p>
          <p className="mx-auto mt-3 max-w-xl text-xs text-muted/70">
            My advice and opinions are simply that. Listen, consider, and use your own judgment.
          </p>
          <p className="mt-2 text-xs">
            <a className="hover:text-neonTeal" href="/legal/terms">Terms</a>
            {" · "}
            <a className="hover:text-neonTeal" href="/legal/privacy">Privacy</a>
            {" · "}
            <a className="hover:text-neonTeal" href="/legal/rules">Rules</a>
            {" · "}
            <a className="hover:text-neonTeal" href="/legal/refunds">Refunds</a>
            {" · "}
            <a className="hover:text-neonTeal" href="/legal/disclaimer">Disclaimer</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
