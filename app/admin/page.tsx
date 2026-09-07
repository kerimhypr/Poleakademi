import Link from "next/link";
import { FileText, PlusCircle, Users, Eye, PenLine, Clock } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").order("updated_at", { ascending: false });
  const articles = (data ?? []) as Article[];

  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.length - published;

  return (
    <main className="shell py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Yönetim alanı</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-paper">İçerik masası</h1>
          <p className="mt-2 text-sm text-zinc-500">Makaleleri yönet, topluluğu izle.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/uyeler" className="button-secondary">
            <Users size={16} /> Üyeler
          </Link>
          <Link href="/admin/yeni" className="button">
            <PlusCircle size={16} /> Yeni makale
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
            <FileText size={14} /> Toplam
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold text-paper">{articles.length}</p>
        </div>
        <div className="panel p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
            <Eye size={14} /> Yayınlandı
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold text-emerald-400">{published}</p>
        </div>
        <div className="panel p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
            <Clock size={14} /> Taslak
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold text-amber">{drafts}</p>
        </div>
      </div>

      <section className="mt-8 panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h2 className="text-sm font-medium text-zinc-300">Tüm içerikler</h2>
          <span className="text-xs text-zinc-500">{articles.length} kayıt</span>
        </div>

        {articles.length ? (
          <ul className="divide-y divide-white/5">
            {articles.map((article) => (
              <li key={article.id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]">
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-paper">{article.title}</h3>
                  <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span className={article.status === "published" ? "text-emerald-400" : "text-amber"}>
                      {article.status === "published" ? "Yayınlandı" : "Taslak"}
                    </span>
                    <span>·</span>
                    <span className="truncate">{article.slug}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{formatDate(article.published_at ?? article.updated_at)}</span>
                  </p>
                </div>
                <Link href={`/admin/makaleler/${article.id}`} className="button-secondary shrink-0 !px-3 !py-2">
                  <PenLine size={14} /> Düzenle
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-14 text-center">
            <FileText size={32} className="mx-auto text-zinc-700" />
            <p className="mt-4 font-medium text-zinc-300">Henüz bir içerik yok.</p>
            <p className="mt-1 text-sm text-zinc-500">İlk makaleyi yazmak için &quot;Yeni makale&quot; de.</p>
            <Link href="/admin/yeni" className="button mt-6">
              <PlusCircle size={16} /> İlk makaleyi yaz
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
