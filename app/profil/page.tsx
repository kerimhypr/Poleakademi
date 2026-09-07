"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Image as ImageIcon, FileText, Crown, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateMyProfile } from "./actions";
import { Avatar } from "@/components/avatar";

type ProfileData = {
  display_name: string;
  bio: string;
  title: string | null;
  avatar_path: string | null;
  role: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [state, action, pending] = useActionState(updateMyProfile, {});

  useEffect(() => {
    const load = async () => {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        router.replace("/giris");
        return;
      }
      const { data } = await sb.from("profiles").select("display_name,bio,title,avatar_path,role").eq("id", user.id).single();
      if (data) setProfile(data as ProfileData);
      setLoaded(true);
    };
    load();
  }, [router]);

  if (!loaded || !profile) {
    return (
      <main className="shell max-w-2xl py-16">
        <div className="panel p-8 animate-pulse">
          <div className="h-6 w-32 rounded bg-white/10" />
          <div className="mt-6 space-y-3">
            <div className="h-12 rounded-xl bg-white/5" />
            <div className="h-24 rounded-xl bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shell max-w-2xl py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Hesabın</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-paper">Profilin</h1>
        <p className="mt-2 text-sm text-zinc-500">Bağımsız bir İslam tartışma ve bilgilendirme topluluğunun parçasısın. Profilin ilmi kimliğini yansıtsın.</p>
      </div>

      <div className="panel p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-6">
          <Avatar path={profile.avatar_path} name={profile.display_name} size="lg" />
          <div>
            <p className="font-medium text-paper">{profile.display_name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs">
              {profile.title ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber/10 px-2.5 py-1 font-semibold text-amber">
                  <Crown size={12} /> {profile.title}
                </span>
              ) : (
                <span className="text-zinc-500">Henüz unvanın yok</span>
              )}
              <span className="mx-1 text-zinc-700">·</span>
              <span className={profile.role === "admin" ? "text-amber" : "text-zinc-500"}>{profile.role === "admin" ? "Yönetici" : "Üye"}</span>
            </p>
          </div>
          <span className="ml-auto hidden items-center gap-1 text-xs text-zinc-600 sm:inline-flex">
            <Sparkles size={14} className="text-amber/60" /> Poleakademi
          </span>
        </div>

        <form action={action} className="space-y-5">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
              <ImageIcon size={16} className="text-zinc-500" /> Profil fotoğrafı
            </span>
            <input
              name="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="block w-full rounded-xl border border-dashed border-white/10 bg-black/20 p-3 text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-200 hover:file:bg-white/15"
            />
            <p className="mt-1.5 text-xs text-zinc-600">JPG, PNG, WebP veya GIF — en fazla 5 MB.</p>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
              <User size={16} className="text-zinc-500" /> Görünen ad
            </span>
            <input name="displayName" defaultValue={profile.display_name} required minLength={2} maxLength={60} className="field" placeholder="Adını nasıl görmek istiyorsun?" />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
              <FileText size={16} className="text-zinc-500" /> Hakkında
            </span>
            <textarea
              name="bio"
              defaultValue={profile.bio}
              maxLength={500}
              rows={4}
              className="field min-h-28 resize-y"
              placeholder="Kısaca kendinden bahset — ilgi alanların, soruların, merakların…"
            />
            <p className="mt-1.5 text-xs text-zinc-600">En fazla 500 karakter.</p>
          </label>

          <div className="rounded-xl border border-amber/10 bg-amber/[0.04] p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-amber">
              <Crown size={16} /> Unvan
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {profile.title ? (
                <>
                  Şu anki unvanın: <span className="font-semibold text-paper">{profile.title}</span>
                </>
              ) : (
                "Henüz bir unvanın yok. Topluluk içindeki ilmi katkınla zamanla bir unvan kazanabilirsin."
              )}
            </p>
            <p className="mt-2 text-xs text-zinc-600">Bağımsız yapımız gereği unvanlar topluluk tarafından takdirin bir ifadesidir.</p>
          </div>

          {state.error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}
          {state.success && <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{state.success}</p>}

          <button className="button w-full sm:w-auto" disabled={pending}>
            {pending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}
