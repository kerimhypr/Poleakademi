import { requireAdmin } from "@/lib/auth";
import { ArticleForm } from "@/components/article-form";
export default async function NewArticlePage() { await requireAdmin(); return <main className="shell max-w-4xl py-12"><div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber">Yeni içerik</p><h1 className="mt-2 font-serif text-4xl text-paper">Bir makale yaz</h1><p className="mt-2 text-zinc-500">Taslak kaydedebilir veya doğrudan yayınlayabilirsin.</p></div><ArticleForm /></main>; }
