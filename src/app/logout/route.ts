import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  const sb = supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}
