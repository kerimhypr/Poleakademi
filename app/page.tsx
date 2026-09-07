import { Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/types";

export const revalidate = 0;
export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false });
  const articles = (data ?? []) as Article[];
  return <main className="shell py-16 sm:py-24"><section className="mx-auto max-w-3xl text-center"><span className="inline-flex items-center gap-2 rounded-full border border-amber/25 bg-amber/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber"><Compass size={14} /> Düşüncenin açık alanı</span><h1 className="mt-7 font-serif text-4xl font-semibold leading-tight text-paper sm:text-6xl">Soruların peşinden, birlikte.</h1><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">Felsefe, din ve eleştirel düşünce etrafında dikkatle okumak, yazmak ve konuşmak için sade bir akademi.</p></section><section className="mt-16"><div className="mb-6 flex items-baseline justify-between"><h2 className="font-serif text-2xl text-paper">Yayınlananlar</h2><span className="text-sm text-zinc-500">{articles.length} makale</span></div>{articles.length ? <div className="grid gap-5 md:grid-cols-2">{articles.map(a => <ArticleCard key={a.id} article={a} />)}</div> : <div className="panel px-6 py-16 text-center"><p className="font-serif text-xl text-paper">Henüz yayınlanmış makale yok.</p><p className="mt-2 text-sm text-zinc-500">İlk düşünceyi paylaşmak için alan hazır.</p></div>}</section></main>;
}
