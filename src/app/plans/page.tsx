import Link from "next/link";
import { SectionTitle, Kicker } from "@/components/ui";

const TIERS = [
  {
    name: "Core",
    price: "$9",
    features: [
      "Rooms — anonymous 2-person conversations",
      "The Writing + post questions (answer each once)",
      "Commons",
      "Shit-Talking Room",
      "The Ladder",
    ],
  },
  {
    name: "Plus",
    price: "$24",
    featured: true,
    features: [
      "Everything in Core",
      "Live small-group session registration (seats open ~24h before)",
      "Priority on Ask in Writing",
    ],
  },
];

export default function PlansPage() {
  return (
    <div>
      <Kicker>Launch pricing</Kicker>
      <SectionTitle>Pick your plan</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {TIERS.map((t) => (
          <div key={t.name} className={`card ${t.featured ? "neon-glow-teal border-neonTeal/60" : ""}`}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold text-neonTeal">{t.name}</h3>
              <p><span className="text-3xl font-black">{t.price}</span><span className="text-muted">/mo</span></p>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-cream/90">
              {t.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            <Link href={`/signup`} className="btn-neon mt-6 block text-center">
              Choose {t.name}
            </Link>
          </div>
        ))}
      </div>
      <div className="card mt-4">
        <h3 className="font-bold text-neonCoral">Ask in Writing — $7 <span className="text-xs font-normal text-muted">founding price, capped submissions</span></h3>
        <p className="mt-1 text-sm text-muted">Submit a question to Stephanie, get a real written answer. Not part of any subscription.</p>
      </div>
      <p className="mt-4 text-sm text-muted">
        One-on-one sessions: coming soon, sold as limited drops — never part of a subscription promise.
      </p>
    </div>
  );
}
