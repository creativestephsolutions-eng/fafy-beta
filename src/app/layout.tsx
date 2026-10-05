import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "FAFY — F*ck Around & Find Yourself",
  description: "No labels here. Underneath, we're all the same.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-6">{children}</main>
        <footer className="border-t border-muted/20 py-6 text-center text-sm text-muted">
          FAFY — F*ck Around & Find Yourself · Operated by CreativeStephSolutions ·
          fafy.community · creativestephsolutions@gmail.com
        </footer>
      </body>
    </html>
  );
}
