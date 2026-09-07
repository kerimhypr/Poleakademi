"use client";

import { useActionState } from "react";
import { User, Image as ImageIcon, FileText, Crown, Sparkles } from "lucide-react";
import { updateMyProfile } from "@/app/profil/actions";
import { Avatar } from "@/components/avatar";
import type { Profile } from "@/lib/types";

export function ProfileFormClient({ initialProfile }: { initialProfile: Profile }) {
  const [state, action, pending] = useActionState(updateMyProfile, {});

  return (
    <div className="panel p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-6">
        <Avatar path={initialProfile.avatar_path} name={initialProfile.display_name} size="lg" />
        <div>
          <p className="font-medium text-paper">{initialProfile.display_name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs">
            {initialProfile.title ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber/10 px-2.5 py-1 font-semibold text-amber">
                <Crown size={12} /> {initialProfile.title}
              </span>
            ) : (
              <span className="text-zinc-500">Henüz unvanın yok</span>
            )}
            <span className="mx-1 text-zinc-700">·</span>
            <span className={initialProfile.role === "admin" ? "text-amber" : "text-zinc-500"}>
              {initialProfile.role === "admin" ? "Yönetici" : "Üye"}
            </span>
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
          <input
            name="displayName"
            defaultValue={initialProfile.display_name}
            required
            minLength={2}
            maxLength={60}
            className="field"
            placeholder="Adını nasıl görmek istiyorsun?"
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
            <FileText size={16} className="text-zinc-500" /> Hakkında
          </span>
          <textarea
            name="bio"
            defaultValue={initialProfile.bio}
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
            {initialProfile.title ? (
              <>
                Şu anki unvanın: <span className="font-semibold text-paper">{initialProfile.title}</span>
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
  );
}
