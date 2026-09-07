"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Quote, Undo2, Redo2 } from "lucide-react";
import { useEffect } from "react";
import type { JsonNode } from "@/lib/types";

const emptyDoc: JsonNode = { type: "doc", content: [{ type: "paragraph" }] };
export function RichTextEditor({ onChange, initialContent = emptyDoc }: { onChange: (json: JsonNode) => void; initialContent?: JsonNode }) {
  const editor = useEditor({ extensions: [StarterKit, Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } })], content: initialContent, editorProps: { attributes: { class: "tiptap" } }, onUpdate: ({ editor }) => onChange(editor.getJSON() as JsonNode) });
  useEffect(() => { if (editor) onChange(editor.getJSON() as JsonNode); }, [editor, onChange]);
  if (!editor) return <div className="field min-h-80 animate-pulse" />;
  const controls = [[Bold, () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")], [Italic, () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")], [List, () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")], [ListOrdered, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList")], [Quote, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote")]] as const;
  return <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20"><div className="flex flex-wrap gap-1 border-b border-white/10 p-2">{controls.map(([Icon, command, active], i) => <button key={i} type="button" aria-label="Biçimlendir" onClick={command} className={`rounded p-2 ${active ? "bg-amber text-black" : "text-zinc-400 hover:bg-white/10"}`}><Icon size={17} /></button>)}<span className="mx-1 border-l border-white/10" /><button type="button" onClick={() => editor.chain().focus().undo().run()} className="rounded p-2 text-zinc-400 hover:bg-white/10"><Undo2 size={17} /></button><button type="button" onClick={() => editor.chain().focus().redo().run()} className="rounded p-2 text-zinc-400 hover:bg-white/10"><Redo2 size={17} /></button></div><EditorContent editor={editor} className="px-4 py-3" /></div>;
}
