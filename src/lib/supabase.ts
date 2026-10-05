import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function supabaseBrowser() {
  return createBrowserClient(url, anon);
}

export function supabaseServer() {
  const store = cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* server component */
        }
      },
    },
  });
}

export async function getProfile() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("*").eq("id", user.id).single();
  return data ? { ...data, user } : null;
}
