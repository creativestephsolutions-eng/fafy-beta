import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !service) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}
const sb = createClient(url, service);

const POST_ID = "00000000-0000-0000-0000-000000000001";

const BODY = `I hear this one constantly, and it irritates me every single time.

Here's the scene. A friend comes to you with a genuine problem — they've just been laid off, or they're in legal trouble, something with real teeth. This isn't a vent-and-forget problem. It requires resolution, or it will have serious consequences for their life. They explain the whole thing: what led up to it, the circumstances around it. And now it's time — time to start figuring out the course of action.

And instead, they say: "It is what it is."

And that's it. Discussion over.

Which immediately makes me want to say: "...UH HUH. SO WHAT ARE YOU GOING TO DO ABOUT IT???"

Because here's what I hear underneath that saying: they've convinced themselves that because the answer isn't being handed to them, stating the obvious reality IS the answer. They don't really think that's what they're doing — but if they called it what it actually amounts to, they'd be just as irritated by it as I am.

What that phrase does is make your mind think it's found the solution, just because something was presented in the shape of one.

And it's not just them. We all have a version of this. Yours might not sound like "it is what it is" — it might sound like "I'll deal with it later," or "there's nothing I can do," or "that's just how I am." Different words, same trick: a sentence that feels like an ending so you don't have to start.

But our minds are not always our friends. Our minds tell us ridiculous things constantly. The kid at McDonald's asks if you want to make your meal a large, and your first thought is he's calling me fat — then you think it over, realize he's required to ask everybody that, and go about your day. We know how to question our outlandish thoughts. We do it on default mode, without even registering that's what we're doing.

The problem is we don't extend that same skepticism to the thoughts that sound reasonable. Nobody in their right mind would say, "Well, I just lost my job, so I guess I don't need my house, or food, or my car anymore — problem solved." Nobody. But say it differently, with the exact same meaning — "it is what it is" — and suddenly it passes for wisdom.

We know. It happened. That's how it "is."

Now what are you going to DO about "it"?`;

const QUESTIONS = [
  `What's the problem in your life right now that you've been answering with "it is what it is" — is that acceptance, or avoidance?`,
  `When did a problem like that get worse because nobody touched it? What did waiting cost?`,
  `What's the smallest concrete move you could make on yours this week?`,
];

async function main() {
  const { data: profiles } = await sb.from("profiles").select("id").eq("is_admin", true).limit(1);
  const adminId = profiles?.[0]?.id ?? null;

  const { error: pErr } = await sb.from("writing_posts").upsert(
    {
      id: POST_ID,
      title: `Sayings, #1: "It Is What It Is"`,
      body: BODY,
      series_label: "Sayings Series · #1",
      created_by: adminId,
    },
    { onConflict: "id" }
  );
  if (pErr) throw pErr;

  await sb.from("writing_questions").delete().eq("post_id", POST_ID);
  const { error: qErr } = await sb.from("writing_questions").insert(
    QUESTIONS.map((body, i) => ({ post_id: POST_ID, position: i + 1, body }))
  );
  if (qErr) throw qErr;

  console.log("Seeded Sayings #1.");
}

main().catch((e) => { console.error(e); process.exit(1); });
