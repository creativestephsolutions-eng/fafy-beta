import { SectionTitle } from "@/components/ui";

export default function TermsPage() {
  return (
    <div className="card mx-auto max-w-3xl space-y-4 text-cream/90">
      <SectionTitle>Terms of Service</SectionTitle>
      <p className="text-sm text-muted">Operated by CreativeStephSolutions · Contact: creativestephsolutions@gmail.com · Effective date: [to be set at beta]</p>
      <p><strong>1. Who can join.</strong> FAFY is 18+. By signing up you confirm you are at least 18.</p>
      <p><strong>2. Plans.</strong> Core ($9/month) and Plus ($24/month) are auto-renewing subscriptions. Cancel anytime; access continues to the end of the paid period.</p>
      <p><strong>3. Advice.</strong> Drop a Question ($7 per thread) covers one starting question plus the follow-ups it takes to answer, with replies on a twice-daily message check. Live Chat Appointments ($9 each) are one-time scheduled chats, not subscriptions. Quick Advice (one question, one answer, no follow-ups, up to 5 per member per day) is included with Plus only.</p>
      <p><strong>4. Beta terms.</strong> Friends invited personally with a beta invite link get in free, no payment. Public beta members get a full first-month refund if they decide they dislike it and explain what didn&apos;t work — help me improve, full refund.</p>
      <p><strong>5. Community conduct.</strong> Follow the Community Rules. We may remove content or suspend accounts for violations including harassment, hate speech, threats, doxxing, spam, or illegal activity. The founder&apos;s moderation decisions are final.</p>
      <p><strong>6. Anonymous Rooms.</strong> Rooms show participants only as Participant 1/2. Activity is logged internally for safety, including friend requests and reports.</p>
      <p><strong>7. Your content.</strong> You grant FAFY a license to display your posts only to operate the service. No scraping or abuse of the platform.</p>
      <p><strong>8. As-is; liability.</strong> The service is provided &quot;as is&quot;. To the maximum extent allowed by law, FAFY and CreativeStephSolutions are not liable for indirect or consequential damages.</p>
      <p><strong>9. Law.</strong> These terms are governed by Alabama law. We may update them with notice.</p>
    </div>
  );
}
