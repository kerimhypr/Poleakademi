import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null };
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) {
    // RLS veya diğer hata durumunda profili null döndür, sayfa kendi fallback'ini gösterir
    console.error("getCurrentUser profile fetch error:", error.message);
    return { user, profile: null as Profile | null };
  }
  // Eğer profil hiç yoksa (trigger çalışmamışsa) boş bir profil oluşturmayı dene
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
    // Sessizce eklemeyi dene, hata olursa yine null dön
    const { data: inserted } = await supabase.from("profiles").insert(fallback).select("*").single();
    return { user, profile: (inserted as Profile | null) ?? (fallback as Profile) };
  }
  return { user, profile: data as Profile | null };
});

export async function requireAdmin() {
  const session = await getCurrentUser();
  if (!session.user || session.profile?.role !== "admin") redirect("/");
  return { user: session.user, profile: session.profile };
}
