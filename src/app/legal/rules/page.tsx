import { SectionTitle } from "@/components/ui";

export default function RulesPage() {
  return (
    <div className="card mx-auto max-w-3xl space-y-4 text-cream/90">
      <SectionTitle>Community Rules</SectionTitle>
      <p>No labels here. Underneath, we&rsquo;re all the same. Talk like it.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>No harassment, hate speech, threats, doxxing, spam, or illegal content.</li>
        <li>Rooms: usernames stay hidden (Participant 1/2). You can leave any room instantly; reports and friend requests are logged for safety.</li>
        <li>Rooms run on questions only — no rebuttals, no correcting, no debating. Curiosity is the only move.</li>
        <li>The Commons: usernames are on. Keep it human — follow-ups, stray thoughts, small talk.</li>
        <li>The founder&rsquo;s call is final.</li>
      </ul>
    </div>
  );
}
