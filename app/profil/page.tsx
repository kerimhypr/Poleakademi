"use client";
import { useActionState } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateMyProfile } from "./actions";

export default function ProfilePage() {
  const router = useRouter(); const [loaded, setLoaded] = useState(false); const [profile, setProfile] = useState<{ display_name: string; bio: string; title: string | null; avatar_path: string | null } | null>(null);
  const [state, action, pending] = useActionState(updateMyProfile, {});
  useEffect(() => { const load = async () => { const sb = createClient(); const { data: { user } } = await sb.auth.getUser(); if (!user) { router.replace("/giris"); return; } const { data } = await sb.from("profiles").select("display_name,bio,title,avatar_path").eq("id", user.id).single(); setProfile(data); setLoaded(true); }; load(); }, [router]);
  if (!loaded || !profile) return <main className="shell py-16 text-zinc-500">Profil hazırlanıyor…</main>;
  return <main className="shell max-w-2xl py-12"><div className="mb-8"><h1 className="font-serif text-4xl text-paper">Profilin</h1><p className="mt-2 text-zinc-500">Buradaki unvan yalnızca yöneticiler tarafından atanabilir.</p></div><form action={action} className="panel space-y-5 p-6"><div><label className="mb-2 block text-sm text-zinc-400">Profil fotoğrafı</label><input name="avatar" type="file" accept="image/png,image/jpeg,image/webp" className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-zinc-200" /></div><label className="block"><span className="mb-2 block text-sm text-zinc-400">Görünen ad</span><input className="field" name="displayName" defaultValue={profile.display_name} required /></label><label className="block"><span className="mb-2 block text-sm text-zinc-400">Hakkında</span><textarea className="field min-h-28 resize-y" name="bio" defaultValue={profile.bio} maxLength={500} /></label><div className="rounded-lg bg-white/5 p-4 text-sm"><span className="text-zinc-500">Unvan: </span><span className="font-medium text-amber">{profile.title || "Henüz atanmadı"}</span></div>{state.error && <p className="text-sm text-red-400">{state.error}</p>}{state.success && <p className="text-sm text-emerald-400">{state.success}</p>}<button className="button" disabled={pending}>{pending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}</button></form></main>;
}
