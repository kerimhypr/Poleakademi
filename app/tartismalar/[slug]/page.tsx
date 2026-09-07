import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ArticleContent } from "@/components/article-content";
import { DiscussionComments } from "@/components/discussion-comments";
import { Avatar } from "@/components/avatar";
import type { Discussion, DiscussionComment, Profile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function DiscussionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("discussions").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const discussion = data as Discussion;

  const [{ data: author }, { data: comments }, { user }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", discussion.author_id).maybeSingle(),
    supabase.from("discussion_comments").select("*, profiles!discussion_comments_author_id_fkey(id,display_name,avatar_path,title)").eq("discussion_id", discussion.id).order("created_at"),
    getCurrentUser(),
  ]);

  const profile = author as Profile | null;

  return (
    <main className="shell max-w-4xl pb-16">
      <div className="py-6 flex items-center gap-2 text-sm">
        <Link href="/tartismalar" className="inline-flex items-center gap-2 text-zinc-500 hover:text-amber">
          <ArrowLeft size={16} /> Tartışmalar
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-500">Başlık</span>
      </div>

      <article className="panel overflow-hidden">
        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-zinc-400">Reddit tarzı tartışma</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-zinc-400">
                <Clock size={12} /> {formatDate(discussion.created_at)}
              </span>
            </div>
            <h1 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-tight text-paper sm:text-4xl">{discussion.title}</h1>

            <div className="mt-6 flex items-center gap-3 border-y border-white/[0.06] py-4">
              <Avatar path={profile?.avatar_path} name={profile?.display_name ?? "Üye"} />
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-paper">
                  <UserIcon size={14} className="text-zinc-500" /> {profile?.display_name ?? "Üye"}
                </p>
                {profile?.title && <p className="mt-0.5 text-xs font-semibold text-amber">{profile.title}</p>}
              </div>
              <span className="ml-auto text-xs text-zinc-500">{formatDate(discussion.created_at)}</span>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <ArticleContent content={discussion.content} />
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <DiscussionComments comments={(comments ?? []) as DiscussionComment[]} discussionId={discussion.id} slug={discussion.slug} signedIn={Boolean(user)} />
          </div>
        </div>
      </article>
    </main>
  );
}
