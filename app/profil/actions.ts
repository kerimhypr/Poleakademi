"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = { error?: string; success?: string };

export async function updateMyProfile(_: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const { user } = await getCurrentUser();
  if (!user) return { error: "Bu işlem için giriş yapmalısınız." };

  const parsed = z
    .object({
      displayName: z.string().trim().min(2, "Görünen ad en az 2 karakter olmalı.").max(60),
      bio: z.string().trim().max(500, "Biyografi en fazla 500 karakter olabilir."),
    })
    .safeParse({ displayName: formData.get("displayName"), bio: formData.get("bio") });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const file = formData.get("avatar");
  let avatarPath: string | undefined;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      return { error: "Profil görseli en fazla 5 MB olan bir resim olmalı." };
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return { error: "Desteklenen formatlar: jpg, png, webp, gif." };
    }
    avatarPath = `${user.id}/${randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(avatarPath, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) return { error: "Profil görseli yüklenemedi: " + error.message };
  }

  const update: Record<string, unknown> = {
    display_name: parsed.data.displayName,
    bio: parsed.data.bio,
  };
  if (avatarPath) update.avatar_path = avatarPath;

  // Önce profil var mı kontrol et — yoksa upsert ile oluştur (RLS insert politikası var)
  const { data: existing } = await supabase.from("profiles").select("id, avatar_path").eq("id", user.id).maybeSingle();
  let error: unknown = null;
  if (!existing) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      display_name: parsed.data.displayName,
      bio: parsed.data.bio,
      avatar_path: avatarPath ?? null,
      title: null,
      role: "user" as const,
    });
    error = insertError;
  } else {
    const payload: Record<string, unknown> = { ...update };
    // avatar güncellenmiyorsa mevcut değeri koru (null'a ezme)
    if (!avatarPath && existing.avatar_path) {
      // update içinde avatar_path yoksa dokunma
    }
    const { error: updateError } = await supabase.from("profiles").update(payload).eq("id", user.id);
    error = updateError;
  }
  if (error) return { error: "Profil güncellenemedi. Lütfen tekrar deneyin." };

  revalidatePath("/profil");
  revalidatePath("/");
  return { success: "Profilin güncellendi." };
}

export async function assignTitle(_: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  await requireAdmin();
  const parsed = z
    .object({
      userId: z.string().uuid(),
      title: z.string().trim().max(80, "Unvan en fazla 80 karakter olabilir."),
    })
    .safeParse({ userId: formData.get("userId"), title: formData.get("title") });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ title: parsed.data.title || null }).eq("id", parsed.data.userId);
  if (error) return { error: "Unvan atanamadı." };
  revalidatePath("/admin/uyeler");
  return { success: "Unvan güncellendi." };
}
