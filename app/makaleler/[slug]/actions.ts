"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
export async function addComment(_: { error?: string }, formData: FormData) {
  const { user } = await getCurrentUser(); if (!user) return { error: "Yorum yapmak için giriş yapmalısınız." };
  const parsed = z.object({ articleId: z.string().uuid(), parentId: z.string().uuid().optional().or(z.literal("")), slug: z.string().min(1), body: z.string().trim().min(1, "Yorum boş olamaz.").max(3000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient(); const { error } = await supabase.from("comments").insert({ article_id: parsed.data.articleId, author_id: user.id, parent_id: parsed.data.parentId || null, body: parsed.data.body });
  if (error) return { error: "Yorum gönderilemedi. Makale yayından kaldırılmış olabilir." }; revalidatePath(`/makaleler/${parsed.data.slug}`); return {};
}
