import { requireAdmin } from "@/lib/auth";
import { ArticleForm } from "@/components/article-form";

export default async function NewArticlePage() {
  await requireAdmin();
  return (
    <main className="shell max-w-4xl py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Yeni içerik</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-paper">Bir makale yaz</h1>
        <p className="mt-2 text-sm text-zinc-500">Taslak kaydedebilir veya doğrudan yayınlayabilirsin. Kapak görseli isteğe bağlı.</p>
      </div>
      <ArticleForm />
      <p className="mt-6 text-center text-xs text-zinc-600">Makale içeriği Tiptap JSON olarak saklanır; HTML injection yoktur.</p>
    </main>
  );
}
