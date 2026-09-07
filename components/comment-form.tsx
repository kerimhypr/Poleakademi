"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { addComment } from "@/app/makaleler/[slug]/actions";

export function CommentForm({
  articleId,
  slug,
  parentId,
  compact = false,
}: {
  articleId: string;
  slug: string;
  parentId?: string;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(addComment, {});

  return (
    <form action={action} className={compact ? "mt-3" : "mt-6"}>

      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="slug" value={slug} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}

      <textarea
        name="body"
        required
        maxLength={3000}
        rows={compact ? 3 : 4}
        className="field min-h-24 resize-y"
        placeholder={parentId ? "Bu yanıta düşünceni ekle…" : "Tartışmaya katkı sun — fikrin neden önemli?"}
      />

      <div className="mt-3 flex items-center gap-3">
        <button disabled={pending} className="button !px-4 !py-2 text-sm">
          <Send size={14} className="shrink-0" />
          {pending ? "Gönderiliyor…" : "Gönder"}
        </button>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <span className="ml-auto text-xs text-zinc-600">En fazla 3000 karakter</span>
      </div>
    </form>
  );
}
