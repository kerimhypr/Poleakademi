import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null };
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { user, profile: data as Profile | null };
});

export async function requireAdmin() {
  const session = await getCurrentUser();
  if (!session.user || session.profile?.role !== "admin") redirect("/");
  return { user: session.user, profile: session.profile };
}
