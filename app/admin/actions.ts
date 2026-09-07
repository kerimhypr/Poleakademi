"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const articleInput = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı.").max(180),
  excerpt: z.string().trim().max(350, "Özet en fazla 350 karakter olabilir.").default(""),
  content: z.string().min(2, "Makale içeriği boş olamaz."),
  status: z.enum(["draft", "published"]),
});

export type ArticleActionState = { error?: string; success?: string };

export async function saveArticle(_: ArticleActionState, formData: FormData): Promise<ArticleActionState> {
  const { user } = await requireAdmin();

  const parsed = articleInput.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let content: unknown;
  try {
    content = JSON.parse(parsed.data.content);
  } catch {
    return { error: "Makale içeriği geçersiz." };
  }
  if (!content || typeof content !== "object") return { error: "Makale içeriği boş olamaz." };

  const supabase = await createClient();
  const file = formData.get("cover");
  let coverPath: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      return { error: "Kapak görseli en fazla 8 MB olan bir resim olmalı." };
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (!["jpg", "jpeg", "png", "webp"].includes(ext)) return { error: "Kapak için jpg, png veya webp kullanın." };
    coverPath = `${randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("article-covers").upload(coverPath, file, { contentType: file.type });
    if (error) return { error: "Kapak görseli yüklenemedi: " + error.message };
  }

  let slug = slugify(parsed.data.title);
  if (!slug) return { error: "Başlık geçerli bir URL adı üretmeli." };

  const { data: duplicate } = await supabase.from("articles").select("id").eq("slug", slug).maybeSingle();
  if (duplicate) slug = `${slug}-${randomUUID().slice(0, 6)}`;

  const now = new Date().toISOString();
  const { error } = await supabase.from("articles").insert({
    author_id: user.id,
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt ?? "",
    content,
    cover_path: coverPath,
    status: parsed.data.status,
    published_at: parsed.data.status === "published" ? now : null,
  });

  if (error) return { error: "Makale kaydedilemedi: " + error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: parsed.data.status === "published" ? "Makale yayınlandı." : "Taslak kaydedildi." };
}

export async function updateArticle(_: ArticleActionState, formData: FormData): Promise<ArticleActionState> {
  await requireAdmin();

  const id = z.string().uuid().safeParse(formData.get("articleId"));
  const parsed = articleInput.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content"),
    status: formData.get("status"),
  });
  if (!id.success || !parsed.success) return { error: "Makale verisi geçersiz." };

  let content: unknown;
  try {
    content = JSON.parse(parsed.data.content);
  } catch {
    return { error: "Makale içeriği geçersiz." };
  }

  const supabase = await createClient();
  const { data: current } = await supabase.from("articles").select("slug,cover_path,published_at").eq("id", id.data).maybeSingle();
  if (!current) return { error: "Makale bulunamadı." };

  const file = formData.get("cover");
  let coverPath = current.cover_path as string | null;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      return { error: "Kapak görseli en fazla 8 MB olan bir resim olmalı." };
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    coverPath = `${randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("article-covers").upload(coverPath, file, { contentType: file.type });
    if (error) return { error: "Kapak görseli yüklenemedi: " + error.message };
  }

  const { error } = await supabase
    .from("articles")
    .update({
      title: parsed.data.title,
      excerpt: parsed.data.excerpt ?? "",
      content,
      cover_path: coverPath,
      status: parsed.data.status,
      published_at: parsed.data.status === "published" ? current.published_at ?? new Date().toISOString() : null,
    })
    .eq("id", id.data);

  if (error) return { error: "Makale güncellenemedi: " + error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/makaleler/${current.slug}`);
  return { success: "Makale güncellendi." };
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("articleId"));
  if (!id.success) return;
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("slug,cover_path").eq("id", id.data).maybeSingle();
  if (!data) return;
  const { error } = await supabase.from("articles").delete().eq("id", id.data);
  if (error) return;
  if (data.cover_path) await supabase.storage.from("article-covers").remove([data.cover_path as string]);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/makaleler/${data.slug}`);
}
