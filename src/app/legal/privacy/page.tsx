import { SectionTitle } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="card mx-auto max-w-3xl space-y-4 text-cream/90">
      <SectionTitle>Privacy Policy</SectionTitle>
      <p className="text-sm text-muted">Operated by CreativeStephSolutions · Contact: creativestephsolutions@gmail.com</p>
      <p><strong>What we collect:</strong> your account email and username; your posts, answers, and comments; room participation; flags, reports, and friend-request logs kept for safety; Ask in Writing submissions.</p>
      <p><strong>Payments:</strong> processed by Stripe. FAFY never sees or stores full card numbers.</p>
      <p><strong>What we don't do:</strong> we never sell your personal data.</p>
      <p><strong>Retention:</strong> safety logs are kept while your account is active and for a limited period after, for safety and legal reasons.</p>
      <p><strong>Your rights:</strong> email creativestephsolutions@gmail.com to request access to or deletion of your data.</p>
    </div>
  );
}
