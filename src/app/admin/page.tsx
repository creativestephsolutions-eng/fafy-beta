import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer, getProfile } from "@/lib/supabase-server";
import { SectionTitle, Kicker } from "@/components/ui";
import WritingForm from "@/components/admin/WritingForm";
import AnswerAskForm from "@/components/admin/AnswerAskForm";
import ReportButtons from "@/components/admin/ReportButtons";
import SetPlanForm from "@/components/admin/SetPlanForm";
import StoriesReviewList from "@/components/admin/StoriesReviewList";

const TABS = [
  ["ask", "Advice Inbox"],
  ["reports", "Room Reports"],
  ["writing", "Write a Post"],
  ["stories", "Stories"],
  ["members", "Members"],
  ["ladder", "Friend Log"],
] as const;

export default async function AdminPage({ searchParams }: { searchParams: { tab?: string } }) {
  const p = await getProfile();
  if (!p) redirect("/login");
  if (!p.is_admin) redirect("/");
  const sb = supabaseServer();
  const tab = (searchParams.tab as string) || "ask";

  const [{ data: reports }, { data: ask }, { data: members }, { data: friends }] =
    await Promise.all([
      sb.from("reports").select("*").eq("status", "open").order("created_at", { ascending: false }),
      sb.from("ask_questions").select("*, profiles(username)").eq("status", "open").order("created_at"),
      sb.from("profiles").select("id,username,plan,is_admin,created_at").order("created_at"),
      sb.from("friend_requests").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

  return (
    <div>
      <Kicker>Founder only</Kicker>
      <SectionTitle>Admin</SectionTitle>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([k, label]) => (
          <Link key={k} href={`/admin?tab=${k}`}
            className={`rounded px-3 py-1.5 text-sm ${tab === k ? "bg-neonTeal text-ink font-bold" : "text-muted hover:text-cream"}`}>
            {label}
          </Link>
        ))}
      </div>

      {tab === "ask" && (
        <div className="space-y-3">
          <p className="text-xs text-muted">
            Twice-daily message check lives here. Live-chat requests arrive as $9 threads — reply to
            confirm a time.
          </p>
          {(ask ?? []).map((q: any) => (
            <div key={q.id} className="card">
              <p className="text-xs uppercase tracking-widest text-muted">
                <span className="font-bold text-neonViolet">@{q.profiles?.username}</span>
                {" · "}{q.price_cents === 900 ? "Live chat request · $9" : q.price_cents === 0 ? "Quick Advice · Plus" : "Drop a Question · $7"}
              </p>
              <p className="mt-1 text-sm text-cream/90">{q.question}</p>
              <AnswerAskForm id={q.id} />
            </div>
          ))}
          {(!ask || ask.length === 0) && <p className="text-muted">Inbox empty.</p>}
        </div>
      )}

      {tab === "reports" && (
        <div key="reports" className="space-y-3">
          {(reports ?? []).map((r: any) => (
            <div key={r.id} className="card">
              <p className="text-sm">{r.note}</p>
              <ReportButtons id={r.id} />
            </div>
          ))}
          {(!reports || reports.length === 0) && <p className="text-muted">No open reports.</p>}
        </div>
      )}

      {tab === "writing" && <WritingForm />}

      {tab === "stories" && <StoriesReviewList />}

      {tab === "members" && (
        <div className="space-y-2">
          {(members ?? []).map((m: any) => (
            <div key={m.id} className="card flex items-center justify-between text-sm">
              <span><span className="font-bold">@{m.username}</span> · {m.plan}{m.is_admin && " · admin"}</span>
              <SetPlanForm id={m.id} current={m.plan} />
            </div>
          ))}
        </div>
      )}

      {tab === "ladder" && (
        <div className="space-y-2 text-sm">
          {(friends ?? []).map((f: any) => (
            <div key={f.id} className="card">
              {f.from_user} → {f.to_user} · {f.status} · {new Date(f.created_at).toLocaleString()}
            </div>
          ))}
          {(!friends || friends.length === 0) && <p className="text-muted">No friend requests yet.</p>}
        </div>
      )}
    </div>
  );
}
