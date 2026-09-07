"use client";

import { useActionState, useState } from "react";
import { saveArticle, updateArticle } from "@/app/admin/actions";
import { RichTextEditor } from "@/components/rich-text-editor";
import type { Article, JsonNode } from "@/lib/types";
import { Image as ImageIcon, Type, AlignLeft, Sparkles } from "lucide-react";

export function ArticleForm({ article }: { article?: Article }) {
  const [content, setContent] = useState<JsonNode>(article?.content ?? { type: "doc", content: [{ type: "paragraph" }] });
  const [state, action, pending] = useActionState(article ? updateArticle : saveArticle, {});

  return (
    <form action={action} className="panel space-y-6 p-6 sm:p-8">
      {article && <input type="hidden" name="articleId" value={article.id} />}

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Type size={16} className="text-amber" /> Başlık <span className="text-red-400">*</span>
        </span>
        <input
          className="field text-base !py-3.5 font-medium"
          name="title"
          defaultValue={article?.title}
          required
          minLength={5}
          maxLength={180}
          placeholder="Düşünceyi başlatan, merak uyandıran başlık"
        />
        <p className="mt-1.5 text-xs text-zinc-600">5–180 karakter. Slug otomatik üretilir.</p>
      </label>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
          <AlignLeft size={16} className="text-zinc-500" /> Kısa özet
        </span>
        <textarea
          className="field min-h-24 resize-y"
          name="excerpt"
          defaultValue={article?.excerpt}
          maxLength={350}
          rows={3}
          placeholder="Ana sayfada ve sosyal paylaşımlarda görünecek 1–2 cümlelik özet (isteğe bağlı, 350 karakter)."
        />
      </label>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
          <ImageIcon size={16} className="text-zinc-500" /> Kapak fotoğrafı
        </span>
        <input
          className="block w-full rounded-xl border border-dashed border-white/10 bg-black/20 p-3 text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-200"
          type="file"
          name="cover"
          accept="image/png,image/jpeg,image/webp"
        />
        <p className="mt-1.5 text-xs text-zinc-600">JPG, PNG veya WebP — en fazla 8 MB. {article?.cover_path && "Mevcut kapak korunur, yeni seçersen değişir."}</p>
        {article?.cover_path && <p className="mt-1 text-xs text-amber">Mevcut: {article.cover_path}</p>}
      </label>

      <div>
        <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Sparkles size={16} className="text-amber" /> Makale <span className="text-red-400">*</span>
        </span>
        <RichTextEditor initialContent={content} onChange={setContent} />
        <input type="hidden" name="content" value={JSON.stringify(content)} />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-white/5 pt-6">
        <button className="button" name="status" value="published" disabled={pending}>
          {pending ? "Kaydediliyor…" : article ? "Güncelle ve yayınla" : "Yayınla"}
        </button>
        <button className="button-secondary" name="status" value="draft" disabled={pending}>
          Taslak kaydet
        </button>
      </div>

      {state.error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}
      {state.success && <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{state.success}</p>}
    </form>
  );
}
