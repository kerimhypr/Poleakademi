import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null as Profile | null };
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (error) {
      console.error("getCurrentUser profile fetch error:", error.message);
      return { user, profile: null as Profile | null };
    }
    if (!data) {
      const fallback: Partial<Profile> = {
        id: user.id,
        display_name: (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "Yeni üye",
        bio: "",
        avatar_path: null,
        title: null,
        role: "user",
        created_at: new Date().toISOString(),
      };
      try {
        const { data: inserted, error: insErr } = await supabase.from("profiles").insert(fallback).select("*").single();
        if (insErr) console.error("fallback profile insert error:", insErr.message);
        return { user, profile: (inserted as Profile | null) ?? (fallback as Profile) };
      } catch (e) {
        console.error("fallback insert exception", e);
        return { user, profile: fallback as Profile };
      }
    }
    return { user, profile: data as Profile | null };
  } catch (e) {
    console.error("getCurrentUser exception", e);
    return { user: null, profile: null as Profile | null };
  }
});

export async function requireAdmin() {
  const session = await getCurrentUser();
  if (!session.user || session.profile?.role !== "admin") redirect("/");
  return { user: session.user, profile: session.profile };
}
