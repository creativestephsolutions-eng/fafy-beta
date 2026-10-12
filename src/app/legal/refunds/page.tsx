import { SectionTitle } from "@/components/ui";

export default function RefundsPage() {
  return (
    <div className="card mx-auto max-w-3xl space-y-4 text-cream/90">
      <SectionTitle>Refund Policy</SectionTitle>
      <p><strong>Beta deal:</strong> public beta members get a full first-month refund if they decide they dislike it and explain what didn&apos;t work. Help me improve — full refund.</p>
      <p><strong>Subscriptions:</strong> cancel anytime; you keep access to the end of the paid period. No partial-period refunds except where required by law.</p>
      <p><strong>Drop a Question ($7/thread):</strong> full refund if your thread is not answered or is declined.</p>
      <p><strong>Live Chat Appointments ($9):</strong> full refund if FAFY cancels your appointment or it never gets scheduled.</p>
      <p><strong>Chargebacks</strong> may result in account closure.</p>
      <p className="text-sm text-muted">Questions: creativestephsolutions@gmail.com</p>
    </div>
  );
}
