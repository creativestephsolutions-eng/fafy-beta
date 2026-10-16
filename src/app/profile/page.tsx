import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import { Kicker } from "@/components/ui";
import StoriesManager from "@/components/StoriesManager";

async function updateProfile(form: FormData) {
  "use server";
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const username = String(form.get("username") ?? "").trim().slice(0, 30);
  const bio = String(form.get("bio") ?? "").trim().slice(0, 500);
  if (!username) return;
  // Check username isn't taken by someone else
  const { data: existing } = await sb.from("profiles")
    .select("id").eq("username", username).neq("id", user.id).maybeSingle();
  if (existing) return; // silently ignore; UI shows error via client check ideally
  await sb.from("profiles").update({ username, bio }).eq("id", user.id);
  revalidatePath("/profile");
}

export default async function ProfilePage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await sb.from("profiles")
    .select("username, bio, plan, created_at").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-2xl">
      <Kicker>Your profile</Kicker>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight">
        <span className="text-neonTeal text-glow-teal">Who</span> people see
      </h1>
      <p className="mb-6 text-cream/85">
        Your profile stays private. Nobody sees it until you both accept a friend request
        after matching in a room — anonymous until you say otherwise.
      </p>
      <form action={updateProfile} className="card space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-cream/80">Username</label>
          <input name="username" className="input" defaultValue={profile?.username ?? ""}
            required maxLength={30} minLength={2} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-cream/80">Bio</label>
          <textarea name="bio" className="input min-h-24" defaultValue={profile?.bio ?? ""}
            maxLength={500} placeholder="A line or two about you — only friends see this." />
          <p className="mt-1 text-xs text-muted">Max 500 characters. Only visible to confirmed friends.</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Plan: <span className="text-cream font-semibold">{profile?.plan}</span></p>
          <button type="submit" className="btn-neon">Save</button>
        </div>
      </form>
      <StoriesManager />
    </div>
  );
}
