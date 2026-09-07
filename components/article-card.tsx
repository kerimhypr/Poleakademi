import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ArticleCard({ article }: { article: Article }) {
  const cover = article.cover_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_path}`
    : null;

  return (
    <Link href={`/makaleler/${article.slug}`} className="panel panel-hover group flex h-full flex-col overflow-hidden">
      {cover && (
        <div className="relative aspect-[16/10] overflow-hidden bg-black/20">
          <img src={cover} alt="" className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        </div>
      )}
      {!cover && <div className="h-1 w-full bg-gradient-to-r from-amber/60 via-amber/20 to-transparent" />}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber/10 px-2.5 py-1 font-medium text-amber">
            <Clock size={12} /> {formatDate(article.published_at)}
          </span>
        </div>
        <h2 className="mt-4 line-clamp-2 font-serif text-2xl font-semibold leading-tight text-paper transition-colors group-hover:text-amber">
          {article.title}
        </h2>
        {article.excerpt ? (
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-zinc-400">{article.excerpt}</p>
        ) : (
          <p className="mt-3 flex-1 text-sm italic text-zinc-600">Özet yok — makalenin kendisi konuşuyor.</p>
        )}
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-200 transition-colors group-hover:text-amber">
          Makaleyi oku <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
