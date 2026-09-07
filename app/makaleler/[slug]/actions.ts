"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function addComment(_: { error?: string }, formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) return { error: "Yorum yapmak için giriş yapmalısın." };

  const parsed = z
    .object({
      articleId: z.string().uuid(),
      parentId: z.string().uuid().optional().or(z.literal("")),
      slug: z.string().min(1),
      body: z.string().trim().min(1, "Yorum boş olamaz.").max(3000, "Yorum en fazla 3000 karakter olabilir."),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    article_id: parsed.data.articleId,
    author_id: user.id,
    parent_id: parsed.data.parentId || null,
    body: parsed.data.body,
  });

  if (error) return { error: "Yorum gönderilemedi. Makale yayından kaldırılmış olabilir veya yanıt geçersiz." };

  revalidatePath(`/makaleler/${parsed.data.slug}`);
  return {};
}

export async function voteComment(formData: FormData): Promise<void> {
  const { user } = await getCurrentUser();
  if (!user) return;
  const parsed = z.object({ commentId: z.string().uuid(), slug: z.string().min(1), value: z.enum(["1", "-1"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const supabase = await createClient();
  const value = parseInt(parsed.data.value, 10) as 1 | -1;
  const { data: existing } = await supabase.from("comment_votes").select("id,value").eq("comment_id", parsed.data.commentId).eq("user_id", user.id).maybeSingle();
  if (existing) {
    if (existing.value === value) {
      await supabase.from("comment_votes").delete().eq("id", existing.id);
    } else {
      await supabase.from("comment_votes").update({ value }).eq("id", existing.id);
    }
  } else {
    await supabase.from("comment_votes").insert({ comment_id: parsed.data.commentId, user_id: user.id, value });
  }
  revalidatePath(`/makaleler/${parsed.data.slug}`);
}
