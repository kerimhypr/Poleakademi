"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Quote, Undo2, Redo2, Link2, Heading2, Code2 } from "lucide-react";
import { useEffect, useCallback } from "react";
import type { JsonNode } from "@/lib/types";

const emptyDoc: JsonNode = { type: "doc", content: [{ type: "paragraph" }] };

export function RichTextEditor({ onChange, initialContent = emptyDoc }: { onChange: (json: JsonNode) => void; initialContent?: JsonNode }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank", class: "text-amber underline" } }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "tiptap min-h-[22rem] p-4 outline-none" },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as JsonNode),
  });

  // Stable callback to avoid infinite loops
  const stableOnChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    if (editor) stableOnChange(editor.getJSON() as JsonNode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Bağlantı URL'si:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    // Basic validation
    try {
      new URL(url);
    } catch {
      alert("Geçerli bir URL girin (https:// ile başlamalı).");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return <div className="field min-h-[22rem] animate-pulse rounded-xl border border-white/10 bg-black/20" />;
  }

  const controls: Array<[React.ElementType, () => void, boolean, string]> = [
    [Bold, () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "Kalın"],
    [Italic, () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "İtalik"],
    [Heading2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }), "Başlık"],
    [List, () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), "Madde listesi"],
    [ListOrdered, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"), "Numaralı liste"],
    [Quote, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"), "Alıntı"],
    [Code2, () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"), "Kod"],
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/[0.02] p-2">
        {controls.map(([Icon, command, active, label], i) => (
          <button
            key={i}
            type="button"
            aria-label={label}
            title={label}
            onClick={command}
            className={`rounded-lg p-2 transition-colors ${active ? "bg-amber text-black" : "text-zinc-400 hover:bg-white/10 hover:text-zinc-200"}`}
          >
            <Icon size={17} />
          </button>
        ))}
        <button
          type="button"
          title="Bağlantı ekle"
          onClick={setLink}
          className={`rounded-lg p-2 ${editor.isActive("link") ? "bg-amber text-black" : "text-zinc-400 hover:bg-white/10"}`}
        >
          <Link2 size={17} />
        </button>
        <span className="mx-1 h-6 w-px bg-white/10" />
        <button type="button" title="Geri al" onClick={() => editor.chain().focus().undo().run()} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10">
          <Undo2 size={17} />
        </button>
        <button type="button" title="İleri al" onClick={() => editor.chain().focus().redo().run()} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10">
          <Redo2 size={17} />
        </button>
      </div>
      <EditorContent editor={editor} className="max-h-[480px] overflow-y-auto" />
      <div className="border-t border-white/5 bg-amber/5 px-3 py-2 text-xs text-zinc-500">İpucu: Metni seçip biçimlendirebilir, bağlantı ekleyebilirsiniz.</div>
    </div>
  );
}
