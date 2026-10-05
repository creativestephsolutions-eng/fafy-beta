import { SectionTitle } from "@/components/ui";

export default function RulesPage() {
  return (
    <div className="card mx-auto max-w-3xl space-y-4 text-cream/90">
      <SectionTitle>Community Rules</SectionTitle>
      <p>No labels here. Underneath, we&rsquo;re all the same. Talk like it.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>No harassment, hate speech, threats, doxxing, spam, or illegal content.</li>
        <li>Rooms: usernames stay hidden (Participant 1/2). You can leave any room instantly; friend requests are logged for safety.</li>
        <li><strong>Shit-Talking Room:</strong> (1) everything comes from a good place — this rule outranks everything; (2) poke jabs, never directly insult; (3) vulgar without being sick; (4) no perverted talk — hard line; (5) use common sense, lines differ per person; (6) flag anything wrong for review. Flagging is housekeeping, not snitching.</li>
        <li>The founder&rsquo;s call is final.</li>
      </ul>
    </div>
  );
}
