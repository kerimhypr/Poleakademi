import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/article-form";
import { deleteArticle } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";
export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) { await requireAdmin(); const { id } = await params; const supabase = await createClient(); const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle(); if (!data) notFound(); const article = data as Article; return <main className="shell max-w-4xl py-12"><div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber">Makale yönetimi</p><h1 className="mt-2 font-serif text-4xl text-paper">Makaleyi düzenle</h1></div><ArticleForm article={article} /><form action={deleteArticle} className="mt-5"><input type="hidden" name="articleId" value={article.id} /><button className="text-sm text-red-400 hover:text-red-300">Makaleyi kalıcı olarak sil</button></form></main>; }
