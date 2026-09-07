import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function MakalelerPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false });
  const articles = (data ?? []) as Article[];

  return (
    <main className="shell py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber">
        <ArrowLeft size={16} /> Ana sayfa
      </Link>
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Resmi</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-paper">Pole&apos;nin Yazıları</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Sadece Pole tarafından paylaşılan resmi yazılar. Herkes yorum yapabilir, ancak yeni yazı yalnızca Pole ekleyebilir.
        </p>
      </div>

      <section className="mt-10">
        {articles.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <div className="panel px-6 py-16 text-center">
            <BookOpen size={32} className="mx-auto text-zinc-700" />
            <h3 className="mt-4 font-serif text-xl font-semibold text-paper">Henüz yazı yok</h3>
            <p className="mt-2 text-sm text-zinc-500">Resmi yazılar burada listelenecek.</p>
          </div>
        )}
      </section>
    </main>
  );
}
