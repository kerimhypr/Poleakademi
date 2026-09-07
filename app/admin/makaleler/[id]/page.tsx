import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/article-form";
import { deleteArticle } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";
import { Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const article = data as Article;

  return (
    <main className="shell max-w-4xl py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Makale yönetimi</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-paper">Makaleyi düzenle</h1>
        <p className="mt-2 text-sm text-zinc-500">Başlık, özet, kapak ve içeriği güncelleyebilir, taslağa çekebilirsin.</p>
      </div>

      <ArticleForm article={article} />

      <form action={deleteArticle} className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-red-300">
          <Trash2 size={16} /> Tehlikeli alan
        </h3>
        <p className="mt-1 text-sm text-zinc-500">Makaleyi ve bağlı tüm yorumları kalıcı olarak siler. Kapak görseli de Storage&apos;dan silinir.</p>
        <input type="hidden" name="articleId" value={article.id} />
        <button className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20">
          Makaleyi kalıcı olarak sil
        </button>
      </form>
    </main>
  );
}
