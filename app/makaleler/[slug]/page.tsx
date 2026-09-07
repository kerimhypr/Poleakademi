import { notFound } from "next/navigation";
import { CalendarDays, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ArticleContent } from "@/components/article-content";
import { Comments } from "@/components/comments";
import { Avatar } from "@/components/avatar";
import type { Article, Comment, Profile } from "@/lib/types";
import { formatDate } from "@/lib/utils";
export const revalidate = 0;
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const supabase = await createClient(); const { data } = await supabase.from("articles").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound(); const article = data as Article;
  const [{ data: author }, { data: comments }, { user }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", article.author_id).maybeSingle(),
    supabase.from("comments").select("*, profiles!comments_author_id_fkey(id,display_name,avatar_path,title)").eq("article_id", article.id).order("created_at"),
    getCurrentUser(),
  ]);
  const cover = article.cover_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_path}` : null;
  return <main className="shell max-w-4xl py-10 sm:py-16"><article><header className="mx-auto max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber">Makale</p><h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-paper sm:text-6xl">{article.title}</h1>{article.excerpt && <p className="mt-6 text-lg leading-8 text-zinc-400">{article.excerpt}</p>}<div className="mt-8 flex flex-wrap items-center gap-4 border-y border-white/10 py-4"><Avatar path={(author as Profile | null)?.avatar_path} name={(author as Profile | null)?.display_name ?? "Yönetici"} /><div className="text-sm"><p className="font-medium text-paper">{(author as Profile | null)?.display_name ?? "Poleakademi"}</p>{(author as Profile | null)?.title && <p className="text-xs text-amber">{(author as Profile).title}</p>}</div><span className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-500"><CalendarDays size={14} /> {formatDate(article.published_at)}</span></div></header>{cover && <img className="mt-10 aspect-[2/1] w-full rounded-2xl object-cover" src={cover} alt="Makale kapak görseli" />}<div className="mx-auto max-w-3xl"><ArticleContent content={article.content} /><div className="mt-10 flex items-center gap-2 border-t border-white/10 pt-6 text-sm text-zinc-500"><MessageCircle size={17} /> Okudukça çoğalan bir konuşma.</div><Comments comments={(comments ?? []) as Comment[]} articleId={article.id} slug={article.slug} signedIn={Boolean(user)} /></div></article></main>;
}
