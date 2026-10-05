import { SectionTitle } from "@/components/ui";

export default function RefundsPage() {
  return (
    <div className="card mx-auto max-w-3xl space-y-4 text-cream/90">
      <SectionTitle>Refund Policy</SectionTitle>
      <p><strong>Subscriptions:</strong> cancel anytime; you keep access to the end of the paid period. No partial-period refunds except where required by law.</p>
      <p><strong>Ask in Writing:</strong> full refund if your question is not answered within 14 days or is declined.</p>
      <p><strong>Live sessions:</strong> refund or credit if FAFY cancels a session you registered for.</p>
      <p><strong>Chargebacks</strong> may result in account closure.</p>
      <p className="text-sm text-muted">Questions: creativestephsolutions@gmail.com</p>
    </div>
  );
}
