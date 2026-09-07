import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ArticleCard({ article }: { article: Article }) {
  const cover = article.cover_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_path}` : null;
  return <Link href={`/makaleler/${article.slug}`} className="panel group block overflow-hidden hover:border-amber/35">{cover && <img src={cover} alt="" className="aspect-[2/1] w-full object-cover opacity-80 transition duration-500 group-hover:opacity-100" />}<div className="p-6"><p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">{formatDate(article.published_at)}</p><h2 className="mt-3 font-serif text-2xl font-semibold text-paper group-hover:text-amber">{article.title}</h2>{article.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">{article.excerpt}</p>}<span className="mt-5 flex items-center gap-1 text-sm font-semibold text-zinc-200">Makaleyi oku <ArrowUpRight size={16} /></span></div></Link>;
}
