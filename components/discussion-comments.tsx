"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { CornerDownRight, MessageCircle, X, PenLine, ThumbsUp, ThumbsDown } from "lucide-react";
import type { DiscussionComment, VoteCounts } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { formatDate } from "@/lib/utils";
import { addDiscussionComment, voteDiscussionComment } from "@/app/tartismalar/actions";

export function DiscussionComments({
  comments,
  discussionId,
  slug,
  signedIn,
  voteCounts = {},
}: {
  comments: DiscussionComment[];
  discussionId: string;
  slug: string;
  signedIn: boolean;
  voteCounts?: Record<string, VoteCounts>;
}) {
  const byParent = new Map<string | null, DiscussionComment[]>();
  comments.forEach((c) => byParent.set(c.parent_id, [...(byParent.get(c.parent_id) ?? []), c]));
  const roots = byParent.get(null) ?? [];
  const [showMain, setShowMain] = useState(false);

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-paper">
        <MessageCircle size={20} className="shrink-0 text-amber" /> Yorumlar
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-normal text-zinc-400">{comments.length}</span>
      </h2>

      {!signedIn && (
        <div className="mt-6 rounded-xl border border-amber/20 bg-amber/5 p-4">
          <p className="text-sm text-amber">Yorum yapmak için giriş yapmalısın.</p>
        </div>
      )}

      {signedIn && (
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
              <DiscussionCommentForm discussionId={discussionId} slug={slug} />
            </div>
          )}
        </div>
      )}

      <div className="mt-8 space-y-5">
        {roots.length ? (
          roots.map((c) => <DiscussionCommentNode key={c.id} comment={c} depth={0} children={byParent} discussionId={discussionId} slug={slug} signedIn={signedIn} voteCounts={voteCounts} />)
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
            <p className="text-sm text-zinc-400">Henüz yorum yok. İlk yorumu sen yap.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function DiscussionCommentNode({
  comment,
  depth,
  children,
  discussionId,
  slug,
  signedIn,
  voteCounts,
}: {
  comment: DiscussionComment;
  depth: number;
  children: Map<string | null, DiscussionComment[]>;
  discussionId: string;
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
          {comment.profiles?.id ? (
            <Link href={`/kullanici/${comment.profiles.id}`} className="shrink-0 rounded-full">
              <Avatar path={comment.profiles?.avatar_path} name={comment.profiles?.display_name ?? "Üye"} size="sm" />
            </Link>
          ) : (
            <Avatar path={comment.profiles?.avatar_path} name={comment.profiles?.display_name ?? "Üye"} size="sm" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              {comment.profiles?.id ? (
                <Link href={`/kullanici/${comment.profiles.id}`} className="text-sm font-semibold text-paper hover:text-amber transition-colors">
                  {comment.profiles?.display_name ?? "Üye"}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-paper">{comment.profiles?.display_name ?? "Üye"}</span>
              )}
              {comment.profiles?.title && <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs font-semibold text-amber">{comment.profiles.title}</span>}
              <time className="text-xs text-zinc-600">{formatDate(comment.created_at)}</time>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">{comment.body}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <form action={voteDiscussionComment} className="inline-flex items-center overflow-hidden rounded-full border border-white/10 bg-white/5">
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
                <button onClick={() => setReply(!reply)} className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-amber transition-colors">
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
                <DiscussionCommentForm discussionId={discussionId} slug={slug} parentId={comment.id} compact />
              </div>
            )}
        </div>
      </div>
      {replies.length > 0 && (
        <div className="mt-5 space-y-5">
          {replies.map((child) => (
            <DiscussionCommentNode key={child.id} comment={child} depth={depth + 1} children={children} discussionId={discussionId} slug={slug} signedIn={signedIn} voteCounts={voteCounts} />
          ))}
        </div>
      )}
      </div>
    </article>
  );
}

function DiscussionCommentForm({ discussionId, slug, parentId, compact }: { discussionId: string; slug: string; parentId?: string; compact?: boolean }) {
  const [state, action, pending] = useActionState(addDiscussionComment, {});
  return (
    <form action={action} className={compact ? "mt-3" : "mt-6"}>
      <input type="hidden" name="discussionId" value={discussionId} />
      <input type="hidden" name="slug" value={slug} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <textarea name="body" required maxLength={3000} rows={compact ? 3 : 4} className="field min-h-24 resize-y" placeholder={parentId ? "Bu yoruma yanıt yaz…" : "Düşünceni paylaş…"} />
      <div className="mt-3 flex items-center gap-3">
        <button disabled={pending} className="button !px-4 !py-2 text-sm">
          {pending ? "Gönderiliyor…" : "Gönder"}
        </button>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      </div>
    </form>
  );
}
