import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import RoomView from "@/components/RoomView";
import { SectionTitle } from "@/components/ui";

export default async function RoomPage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: m } = await sb.from("room_members")
    .select("id").eq("room_id", params.id).eq("user_id", user.id).is("left_at", null).single();
  if (!m) redirect("/rooms");
  return (
    <div>
      <SectionTitle>The Room</SectionTitle>
      <RoomView roomId={params.id} />
    </div>
  );
}
