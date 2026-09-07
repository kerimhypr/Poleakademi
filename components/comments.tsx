"use client";

import { useState } from "react";
import { CornerDownRight, MessageCircle, X, PenLine, ThumbsUp, ThumbsDown } from "lucide-react";
import type { Comment, VoteCounts } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { formatDate } from "@/lib/utils";
import { CommentForm } from "@/components/comment-form";
import { voteComment } from "@/app/makaleler/[slug]/actions";

export function Comments({
  comments,
  articleId,
  slug,
  signedIn,
  voteCounts = {},
}: {
  comments: Comment[];
  articleId: string;
  slug: string;
  signedIn: boolean;
  voteCounts?: Record<string, VoteCounts>;
}) {
  const byParent = new Map<string | null, Comment[]>();
  comments.forEach((c) => byParent.set(c.parent_id, [...(byParent.get(c.parent_id) ?? []), c]));
  const roots = byParent.get(null) ?? [];
  const [showMain, setShowMain] = useState(false);

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-paper">
        <MessageCircle size={20} className="shrink-0 text-amber" /> Tartışma
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-normal text-zinc-400">{comments.length}</span>
      </h2>
      <p className="mt-1 text-sm text-zinc-500">Saygılı, derin ve topluluk odaklı — her yanıt kalıcıdır.</p>

      {signedIn ? (
        <div className="mt-6">
          {!showMain ? (
            <button onClick={() => setShowMain(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:border-white/15 transition-colors">
              <PenLine size={16} className="shrink-0" /> Yorum yaz
            </button>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-300">Yorumun</span>
                <button onClick={() => setShowMain(false)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
                  <X size={14} className="shrink-0" /> Kapat
                </button>
              </div>
              <CommentForm articleId={articleId} slug={slug} />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-amber/20 bg-amber/5 p-4">
          <p className="text-sm text-amber">Tartışmaya katılmak için giriş yapmalısın.</p>
          <p className="mt-1 text-xs text-zinc-500">Üye olmayanlar yorumları okuyabilir, yalnızca üyeler yazabilir.</p>
        </div>
      )}

      <div className="mt-8 space-y-5">
        {roots.length ? (
          roots.map((comment) => <CommentNode key={comment.id} comment={comment} depth={0} children={byParent} articleId={articleId} slug={slug} signedIn={signedIn} voteCounts={voteCounts} />)
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
            <p className="text-sm text-zinc-400">Henüz yorum yok. İlk sözü sen söyle.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CommentNode({
  comment,
  depth,
  children,
  articleId,
  slug,
  signedIn,
  voteCounts,
}: {
  comment: Comment;
  depth: number;
  children: Map<string | null, Comment[]>;
  articleId: string;
  slug: string;
  signedIn: boolean;
  voteCounts: Record<string, VoteCounts>;
}) {
  const [reply, setReply] = useState(false);
  const replies = children.get(comment.id) ?? [];
  const vc = voteCounts[comment.id] ?? { likes: 0, dislikes: 0, score: 0, userVote: null };

  return (
    <article className={depth > 0 ? "relative" : ""}>
      {depth > 0 && <div className="absolute left-0 top-2 bottom-2 w-px bg-white/[0.07]" />}
      <div className={depth > 0 ? "ml-6 sm:ml-8" : ""}>
        <div className="flex gap-3">
          <Avatar path={comment.profiles?.avatar_path} name={comment.profiles?.display_name ?? "Üye"} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-paper">{comment.profiles?.display_name ?? "Üye"}</span>
              {comment.profiles?.title && <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs font-semibold text-amber">{comment.profiles.title}</span>}
              <time className="text-xs text-zinc-600">{formatDate(comment.created_at)}</time>
            </div>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">{comment.body}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Like / Dislike - bug-free: server action handles toggle (same value → delete, opposite → update) */}
              <form action={voteComment} className="inline-flex items-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                <input type="hidden" name="commentId" value={comment.id} />
                <input type="hidden" name="slug" value={slug} />
                <button name="value" value="1" disabled={!signedIn} title={signedIn ? "Beğen" : "Giriş yapmalısın"} className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors ${vc.userVote === 1 ? "bg-amber text-black" : "text-zinc-400 hover:bg-white/10 hover:text-amber"} disabled:opacity-50`}>
                  <ThumbsUp size={12} className="shrink-0" /> {vc.likes}
                </button>
                <span className="h-4 w-px bg-white/10" />
                <button name="value" value="-1" disabled={!signedIn} title={signedIn ? "Beğenme" : "Giriş yapmalısın"} className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors ${vc.userVote === -1 ? "bg-red-500 text-white" : "text-zinc-400 hover:bg-white/10 hover:text-red-400"} disabled:opacity-50`}>
                  <ThumbsDown size={12} className="shrink-0" /> {vc.dislikes}
                </button>
              </form>
              {vc.score !== 0 && <span className={`text-xs font-medium ${vc.score > 0 ? "text-emerald-400" : "text-red-400"}`}>{vc.score > 0 ? `+${vc.score}` : vc.score}</span>}

              {signedIn && (
                <button
                  onClick={() => setReply(!reply)}
                  className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-amber transition-colors"
                >
                  <CornerDownRight size={12} className="shrink-0" /> {reply ? "Kapat" : "Yanıtla"}
                </button>
              )}
            </div>

            {reply && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-400">Yanıt yaz</span>
                  <button onClick={() => setReply(false)} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300">
                    <X size={12} className="shrink-0" /> Kapat
                  </button>
                </div>
                <CommentForm articleId={articleId} slug={slug} parentId={comment.id} compact />
              </div>
            )}
          </div>
        </div>

        {replies.length > 0 && (
          <div className="mt-5 space-y-5">
            {replies.map((child) => (
              <CommentNode key={child.id} comment={child} depth={depth + 1} children={children} articleId={articleId} slug={slug} signedIn={signedIn} voteCounts={voteCounts} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
