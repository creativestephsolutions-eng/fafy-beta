import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { Kicker } from "@/components/ui";

async function respondLadder(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const invite_id = String(form.get("invite_id"));
  const accept = form.get("accept") === "yes";
  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}`, { method: "HEAD" }).catch(() => {});
  // Use the ladder API route for accept/decline logic
  const res = await sb.from("ladder_invites").select("*").eq("id", invite_id).single();
  const inv = res.data;
  if (!inv || inv.to_user !== user.id) return;
  await sb.from("ladder_invites").update({ status: accept ? "accepted" : "declined" }).eq("id", invite_id);
  if (accept) {
    await sb.from("friend_requests").upsert(
      { from_user: user.id, to_user: inv.from_user, status: "open" },
      { onConflict: "from_user,to_user" }
    );
  }
  revalidatePath("/friends");
}

async function respondFriend(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const req_id = String(form.get("req_id"));
  const accept = form.get("accept") === "yes";
  const { data: fr } = await sb.from("friend_requests").select("*").eq("id", req_id).single();
  if (!fr || fr.to_user !== user.id) return;
  await sb.from("friend_requests").update({ status: accept ? "accepted" : "declined" }).eq("id", req_id);
  revalidatePath("/friends");
}

export default async function FriendsPage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: invites } = await sb.from("ladder_invites")
    .select("id, room_id, created_at, profiles!ladder_invites_from_user_fkey(username)")
    .eq("to_user", user.id).eq("status", "open").order("created_at", { ascending: false });

  const { data: requests } = await sb.from("friend_requests")
    .select("id, created_at, profiles!friend_requests_from_user_fkey(username)")
    .eq("to_user", user.id).eq("status", "open").order("created_at", { ascending: false });

  const { data: friendships } = await sb.from("friend_requests")
    .select("id, from_user, to_user, profiles!friend_requests_from_user_fkey(username), to_profiles:profiles!friend_requests_to_user_fkey(username)")
    .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
    .eq("status", "accepted");

  const friends = (friendships ?? []).map((f: any) => {
    const isSender = f.from_user === user.id;
    return {
      id: isSender ? f.to_user : f.from_user,
      username: isSender ? f.to_profiles?.username : f.profiles?.username,
    };
  });

  return (
    <div className="mx-auto max-w-3xl">
      <Kicker>Friends</Kicker>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight">
        <span className="text-neonTeal text-glow-teal">People</span> you&apos;ve matched with
      </h1>
      <p className="mb-6 max-w-2xl text-cream/85">
        After a room, either of you can invite the other to a private 1:1. Accept, and you become
        friends — that&apos;s when profiles unlock and you can message each other directly.
        Anonymous until you both say otherwise.
      </p>

      {(invites ?? []).length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-bold text-neonCoral">1:1 invites</h2>
          <div className="space-y-2">
            {(invites ?? []).map((inv: any) => (
              <div key={inv.id} className="card flex items-center justify-between gap-3">
                <p className="text-sm text-cream/85">
                  <span className="font-semibold text-cream">{inv.profiles?.username ?? "Someone"}</span>
                  {" "}invited you to a private 1:1 after your room.
                </p>
                <div className="flex gap-2">
                  <form action={respondLadder}>
                    <input type="hidden" name="invite_id" value={inv.id} />
                    <input type="hidden" name="accept" value="yes" />
                    <button className="btn-neon !px-3 !py-1 text-sm">Accept</button>
                  </form>
                  <form action={respondLadder}>
                    <input type="hidden" name="invite_id" value={inv.id} />
                    <input type="hidden" name="accept" value="no" />
                    <button className="btn-ghost !px-3 !py-1 text-sm">Decline</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(requests ?? []).length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-bold text-neonCoral">Friend requests</h2>
          <div className="space-y-2">
            {(requests ?? []).map((r: any) => (
              <div key={r.id} className="card flex items-center justify-between gap-3">
                <p className="text-sm text-cream/85">
                  <span className="font-semibold text-cream">{r.profiles?.username ?? "Someone"}</span>
                  {" "}wants to be friends.
                </p>
                <div className="flex gap-2">
                  <form action={respondFriend}>
                    <input type="hidden" name="req_id" value={r.id} />
                    <input type="hidden" name="accept" value="yes" />
                    <button className="btn-neon !px-3 !py-1 text-sm">Accept</button>
                  </form>
                  <form action={respondFriend}>
                    <input type="hidden" name="req_id" value={r.id} />
                    <input type="hidden" name="accept" value="no" />
                    <button className="btn-ghost !px-3 !py-1 text-sm">Decline</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-bold text-neonTeal">Your friends</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-muted">No friends yet. Match with someone in a room first.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {friends.map((f) => (
              <Link key={f.id} href={`/friends/${f.id}`}
                className="card flex items-center justify-between hover:border-neonTeal/50">
                <span className="font-semibold text-cream">{f.username ?? "Friend"}</span>
                <span className="text-sm text-neonTeal">Message →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
