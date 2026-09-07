"use client";

import { useState } from "react";
import { CornerDownRight, MessageCircle } from "lucide-react";
import type { Comment } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { formatDate } from "@/lib/utils";
import { CommentForm } from "@/components/comment-form";

export function Comments({
  comments,
  articleId,
  slug,
  signedIn,
}: {
  comments: Comment[];
  articleId: string;
  slug: string;
  signedIn: boolean;
}) {
  const byParent = new Map<string | null, Comment[]>();
  comments.forEach((c) => byParent.set(c.parent_id, [...(byParent.get(c.parent_id) ?? []), c]));
  const roots = byParent.get(null) ?? [];

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-paper">
        <MessageCircle size={20} className="text-amber" /> Tartışma
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-normal text-zinc-400">{comments.length}</span>
      </h2>
      <p className="mt-1 text-sm text-zinc-500">Saygılı, derin ve topluluk odaklı — her yanıt kalıcıdır.</p>

      {signedIn ? (
        <CommentForm articleId={articleId} slug={slug} />
      ) : (
        <div className="mt-6 rounded-xl border border-amber/20 bg-amber/5 p-4">
          <p className="text-sm text-amber">Tartışmaya katılmak için giriş yapmalısın.</p>
          <p className="mt-1 text-xs text-zinc-500">Üye olmayanlar yorumları okuyabilir, yalnızca üyeler yazabilir.</p>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {roots.length ? (
          roots.map((comment) => <CommentNode key={comment.id} comment={comment} depth={0} children={byParent} articleId={articleId} slug={slug} signedIn={signedIn} />)
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
}: {
  comment: Comment;
  depth: number;
  children: Map<string | null, Comment[]>;
  articleId: string;
  slug: string;
  signedIn: boolean;
}) {
  const [reply, setReply] = useState(false);
  const replies = children.get(comment.id) ?? [];

  return (
    <article className={depth ? "ml-3 border-l border-white/10 pl-4 sm:ml-6 sm:pl-6" : ""}>
      <div className="flex gap-3">
        <Avatar path={comment.profiles?.avatar_path} name={comment.profiles?.display_name ?? "Üye"} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-paper">{comment.profiles?.display_name ?? "Üye"}</span>
            {comment.profiles?.title && <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs font-semibold text-amber">{comment.profiles.title}</span>}
            <time className="text-xs text-zinc-600">{formatDate(comment.created_at)}</time>
          </div>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">{comment.body}</p>

          {signedIn && (
            <button
              onClick={() => setReply(!reply)}
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-amber"
            >
              <CornerDownRight size={12} /> {reply ? "Kapat" : "Yanıtla"}
            </button>
          )}

          {reply && <CommentForm articleId={articleId} slug={slug} parentId={comment.id} compact />}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-5 space-y-5">
          {replies.map((child) => (
            <CommentNode key={child.id} comment={child} depth={depth + 1} children={children} articleId={articleId} slug={slug} signedIn={signedIn} />
          ))}
        </div>
      )}
    </article>
  );
}
