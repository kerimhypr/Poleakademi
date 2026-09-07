"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const discussionInput = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı.").max(180),
  content: z.string().min(2, "İçerik boş olamaz."),
});

export type DiscussionActionState = { error?: string; success?: string };

export async function createDiscussion(_: DiscussionActionState, formData: FormData): Promise<DiscussionActionState> {
  const { user } = await getCurrentUser();
  if (!user) return { error: "Tartışma başlatmak için giriş yapmalısın." };

  const parsed = discussionInput.safeParse({ title: formData.get("title"), content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let content: unknown;
  try {
    content = JSON.parse(parsed.data.content);
  } catch {
    return { error: "İçerik geçersiz." };
  }

  let slug = slugify(parsed.data.title);
  if (!slug) return { error: "Başlık geçerli bir slug üretmeli." };

  const supabase = await createClient();
  const { data: dup } = await supabase.from("discussions").select("id").eq("slug", slug).maybeSingle();
  if (dup) slug = `${slug}-${randomUUID().slice(0, 6)}`;

  const { error } = await supabase.from("discussions").insert({
    author_id: user.id,
    slug,
    title: parsed.data.title,
    content,
  });
  if (error) return { error: "Tartışma oluşturulamadı: " + error.message };

  revalidatePath("/tartismalar");
  revalidatePath("/");
  return { success: "Tartışma başlatıldı." };
}

export async function addDiscussionComment(_: { error?: string }, formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) return { error: "Yorum yapmak için giriş yapmalısın." };

  const parsed = z
    .object({
      discussionId: z.string().uuid(),
      parentId: z.string().uuid().optional().or(z.literal("")),
      slug: z.string().min(1),
      body: z.string().trim().min(1, "Yorum boş olamaz.").max(3000),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("discussion_comments").insert({
    discussion_id: parsed.data.discussionId,
    author_id: user.id,
    parent_id: parsed.data.parentId || null,
    body: parsed.data.body,
  });
  if (error) return { error: "Yorum gönderilemedi." };
  revalidatePath(`/tartismalar/${parsed.data.slug}`);
  return {};
}
