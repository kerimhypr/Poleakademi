"use client";

import { useActionState, useState } from "react";
import { createDiscussion } from "@/app/tartismalar/actions";
import { RichTextEditor } from "@/components/rich-text-editor";
import type { JsonNode } from "@/lib/types";

export function DiscussionForm() {
  const [content, setContent] = useState<JsonNode>({ type: "doc", content: [{ type: "paragraph" }] });
  const [state, action, pending] = useActionState(createDiscussion, {});

  return (
    <form action={action} className="panel space-y-6 p-6 sm:p-8">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-300">Başlık *</span>
        <input name="title" required minLength={5} maxLength={180} placeholder="Tartışma başlığı — net ve merak uyandıran" className="field text-base" />
      </label>

      <div>
        <span className="mb-2 block text-sm font-medium text-zinc-300">İçerik *</span>
        <RichTextEditor initialContent={content} onChange={setContent} />
        <input type="hidden" name="content" value={JSON.stringify(content)} />
        <p className="mt-2 text-xs text-zinc-600">Reddit tarzı: Herkes görebilir, herkes yorum yapabilir.</p>
      </div>

      <button disabled={pending} className="button">
        {pending ? "Oluşturuluyor…" : "Tartışmayı başlat"}
      </button>

      {state.error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}
      {state.success && <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{state.success}</p>}
    </form>
  );
}
