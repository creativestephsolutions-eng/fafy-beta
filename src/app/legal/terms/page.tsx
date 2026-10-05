import { SectionTitle } from "@/components/ui";

export default function TermsPage() {
  return (
    <div className="card mx-auto max-w-3xl space-y-4 text-cream/90">
      <SectionTitle>Terms of Service</SectionTitle>
      <p className="text-sm text-muted">Operated by CreativeStephSolutions · Contact: creativestephsolutions@gmail.com · Effective date: [to be set at beta]</p>
      <p><strong>1. Who can join.</strong> FAFY is 18+. By signing up you confirm you are at least 18.</p>
      <p><strong>2. Plans.</strong> Core ($9/month) and Plus ($24/month) are auto-renewing subscriptions billed through Stripe. Cancel anytime; access continues to the end of the paid period.</p>
      <p><strong>3. Ask in Writing.</strong> $7 per question (founding price), submissions capped. One-on-one sessions are not currently offered; they will be sold as limited drops, not as part of any subscription.</p>
      <p><strong>4. Live sessions.</strong> Plus members only. Registration opens about 24 hours before each session; seats are limited and never guaranteed.</p>
      <p><strong>5. Community conduct.</strong> Follow the Community Rules. We may remove content or suspend accounts for violations including harassment, hate speech, threats, doxxing, spam, perverted talk, or illegal activity. The founder's moderation decisions are final.</p>
      <p><strong>6. Anonymous Rooms.</strong> Rooms show participants only as Participant 1/2. Activity is logged internally for safety, including friend requests and reports.</p>
      <p><strong>7. Your content.</strong> You grant FAFY a license to display your posts only to operate the service. No scraping or abuse of the platform.</p>
      <p><strong>8. As-is; liability.</strong> The service is provided "as is". To the maximum extent allowed by law, FAFY and CreativeStephSolutions are not liable for indirect or consequential damages.</p>
      <p><strong>9. Law.</strong> These terms are governed by Alabama law. We may update them with notice.</p>
    </div>
  );
}
