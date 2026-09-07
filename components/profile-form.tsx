"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Image as ImageIcon, FileText, Crown, Sparkles, Upload, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";
import type { Profile } from "@/lib/types";

export function ProfileFormClient({ initialProfile }: { initialProfile: Profile }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(initialProfile.display_name);
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setPreview(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", msg: "Dosya en fazla 5 MB olmalı." });
      if (fileRef.current) fileRef.current.value = "";
      setPreview(null);
      return;
    }
    setStatus(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        setStatus({ type: "error", msg: "Oturum bulunamadı, lütfen tekrar giriş yap." });
        setSaving(false);
        return;
      }
      if (displayName.trim().length < 2) {
        setStatus({ type: "error", msg: "Görünen ad en az 2 karakter olmalı." });
        setSaving(false);
        return;
      }
      if (bio.length > 500) {
        setStatus({ type: "error", msg: "Biyografi en fazla 500 karakter." });
        setSaving(false);
        return;
      }

      let avatar_path: string | null = initialProfile.avatar_path;

      const file = fileRef.current?.files?.[0];
      if (file && file.size > 0) {
        if (!file.type.startsWith("image/")) {
          setStatus({ type: "error", msg: "Sadece resim dosyası yükleyebilirsin." });
          setSaving(false);
          return;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await sb.storage.from("avatars").upload(path, file, {
          contentType: file.type,
          upsert: true,
        });
        if (upErr) {
          setStatus({ type: "error", msg: "Fotoğraf yüklenemedi: " + upErr.message });
          setSaving(false);
          return;
        }
        avatar_path = path;
      }

      const { error } = await sb
        .from("profiles")
        .update({ display_name: displayName.trim(), bio: bio.trim(), avatar_path })
        .eq("id", user.id);

      if (error) {
        setStatus({ type: "error", msg: "Profil güncellenemedi: " + error.message });
        setSaving(false);
        return;
      }

      setStatus({ type: "success", msg: "Profilin güncellendi!" });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setStatus({ type: "error", msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-6">
        <Avatar path={preview ? null : initialProfile.avatar_path} name={initialProfile.display_name} size="lg" />
        {preview && <img src={preview} alt="Önizleme" className="h-16 w-16 rounded-full object-cover ring-1 ring-white/10" />}
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

      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
            <ImageIcon size={16} className="text-zinc-500" /> Profil fotoğrafı
          </span>
          <input
            ref={fileRef}
            onChange={onFileChange}
            name="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="block w-full rounded-xl border border-dashed border-white/10 bg-black/20 p-3 text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-200 hover:file:bg-white/15"
          />
          <p className="mt-1.5 text-xs text-zinc-600">JPG, PNG, WebP veya GIF — en fazla 5 MB. Seçince önizleme görünür, Kaydet deyince yüklenir.</p>
          {preview && <p className="mt-2 text-xs text-amber">Önizleme hazır — Kaydet ile yükle.</p>}
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
            <User size={16} className="text-zinc-500" /> Görünen ad
          </span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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
            value={bio}
            onChange={(e) => setBio(e.target.value)}
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

        {status && (
          <p className={`rounded-xl border px-4 py-3 text-sm ${status.type === "error" ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"}`}>
            {status.msg}
          </p>
        )}

        <button type="submit" className="button w-full sm:w-auto" disabled={saving}>
          {saving ? (
            <>
              <Upload size={16} className="animate-pulse" /> Kaydediliyor…
            </>
          ) : (
            <>
              <Check size={16} /> Değişiklikleri kaydet
            </>
          )}
        </button>
      </form>
    </div>
  );
}
