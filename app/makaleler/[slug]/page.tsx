import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ArrowLeft, Clock, User as UserIcon, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ArticleContent } from "@/components/article-content";
import { Comments } from "@/components/comments";
import { Avatar } from "@/components/avatar";
import type { Article, Comment, Profile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function estimateReadingTime(content: unknown): string {
  try {
    const text = JSON.stringify(content);
    const words = text.split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} dk okuma`;
  } catch {
    return "—";
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("articles").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const article = data as Article;

  // Only published articles are visible to anon; admins see all (RLS handles)
  if (article.status !== "published") {
    const { profile } = await getCurrentUser();
    if (profile?.role !== "admin") notFound();
  }

  const [{ data: author }, { data: comments }, { user }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", article.author_id).maybeSingle(),
    supabase
      .from("comments")
      .select("*, profiles!comments_author_id_fkey(id,display_name,avatar_path,title)")
      .eq("article_id", article.id)
      .order("created_at", { ascending: true }),
    getCurrentUser(),
  ]);

  // Vote counts for comments
  const commentIds = (comments ?? []).map((c: { id: string }) => c.id);
  const voteCounts: Record<string, { likes: number; dislikes: number; score: number; userVote: 1 | -1 | null }> = {};
  if (commentIds.length) {
    const { data: votes } = await supabase.from("comment_votes").select("comment_id, value, user_id").in("comment_id", commentIds);
    for (const c of commentIds) {
      const v = (votes ?? []).filter((x) => x.comment_id === c);
      const likes = v.filter((x) => x.value === 1).length;
      const dislikes = v.filter((x) => x.value === -1).length;
      const userVote = (v.find((x) => x.user_id === user?.id)?.value as 1 | -1 | undefined) ?? null;
      voteCounts[c] = { likes, dislikes, score: likes - dislikes, userVote };
    }
  }

  const cover = article.cover_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_path}`
    : null;

  const profile = author as Profile | null;

  return (
    <main className="shell max-w-4xl pb-16">
      <div className="py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber">
          <ArrowLeft size={16} /> Ana sayfa
        </Link>
      </div>

      <article className="panel overflow-hidden">
        {cover && (
          <div className="relative aspect-[16/9] overflow-hidden bg-black/20">
            <img src={cover} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/20 bg-amber/10 px-3 py-1 font-semibold uppercase tracking-widest text-amber">
                Makale
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-zinc-400">
                <Clock size={12} /> {estimateReadingTime(article.content)}
              </span>
              {article.status === "draft" && (
                <span className="rounded-full bg-amber px-2.5 py-1 font-semibold text-black">Taslak</span>
              )}
            </div>

            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight text-paper sm:text-5xl">{article.title}</h1>

            {article.excerpt && <p className="mt-4 text-lg leading-8 text-zinc-400">{article.excerpt}</p>}

            <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-white/[0.06] py-5">
              {profile?.id ? (
                <Link href={`/kullanici/${profile.id}`} className="shrink-0">
                  <Avatar path={profile?.avatar_path} name={profile?.display_name ?? "Poleakademi"} />
                </Link>
              ) : (
                <Avatar path={profile?.avatar_path} name={profile?.display_name ?? "Poleakademi"} />
              )}
              <div className="min-w-0">
                {profile?.id ? (
                  <Link href={`/kullanici/${profile.id}`} className="flex items-center gap-2 text-sm font-medium text-paper hover:text-amber transition-colors">
                    <UserIcon size={14} className="text-zinc-500" /> {profile?.display_name ?? "Poleakademi"}
                  </Link>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-medium text-paper">
                    <UserIcon size={14} className="text-zinc-500" /> {profile?.display_name ?? "Poleakademi"}
                  </p>
                )}
                {profile?.title && <p className="mt-0.5 text-xs font-semibold text-amber">{profile.title}</p>}
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
                <CalendarDays size={14} /> {formatDate(article.published_at ?? article.created_at)}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <ArticleContent content={article.content} />
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <div className="flex items-center gap-2 border-t border-white/[0.06] pt-8 text-sm text-zinc-500">
              <MessageCircle size={16} className="text-amber" />
              Düşüncen varsa, tartışmaya katıl — her yanıt metni zenginleştirir.
            </div>
            <Comments
              comments={(comments ?? []) as Comment[]}
              articleId={article.id}
              slug={article.slug}
              signedIn={Boolean(user)}
              voteCounts={voteCounts}
            />
          </div>
        </div>
      </article>
    </main>
  );
}
