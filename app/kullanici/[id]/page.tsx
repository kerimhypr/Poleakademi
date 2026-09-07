import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Crown, Shield, MessageCircle, FileText, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function KullaniciPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) notFound();
  const p = profile as Profile & { bio: string | null; username?: string | null };

  // Kullanıcının tartışmaları ve yorum sayıları (basit istatistik)
  const [{ count: discussionCount }, { count: commentCount }, { count: discussionCommentCount }] = await Promise.all([
    supabase.from("discussions").select("id", { count: "exact", head: true }).eq("author_id", id),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("author_id", id),
    supabase.from("discussion_comments").select("id", { count: "exact", head: true }).eq("author_id", id),
  ]);

  const totalComments = (commentCount ?? 0) + (discussionCommentCount ?? 0);

  // Son tartışmaları
  const { data: recentDiscussions } = await supabase.from("discussions").select("id,slug,title,created_at").eq("author_id", id).order("created_at", { ascending: false }).limit(3);

  return (
    <main className="shell max-w-4xl py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber">
        <ArrowLeft size={16} /> Ana sayfa
      </Link>

      <div className="mt-6 panel overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-amber/20 via-amber/10 to-transparent" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar path={p.avatar_path} name={p.display_name} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-paper">{p.display_name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {p.title ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber/10 px-3 py-1 text-sm font-semibold text-amber">
                    <Crown size={14} /> {p.title}
                  </span>
                ) : (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-zinc-500">Unvan yok</span>
                )}
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${p.role === "admin" ? "bg-amber text-black" : "bg-white/5 text-zinc-400"}`}>
                  {p.role === "admin" ? <Shield size={12} /> : <User size={12} />} {p.role === "admin" ? "Yönetici" : "Üye"}
                </span>
              </div>
              {p.bio ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{p.bio}</p>
              ) : (
                <p className="mt-4 text-sm italic text-zinc-600">Bu kullanıcı henüz bir biyografi eklememiş.</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={12} /> Üyelik: {formatDate(p.created_at)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileText size={12} /> {discussionCount ?? 0} tartışma
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle size={12} /> {totalComments} yorum
                </span>
              </div>
            </div>
          </div>

          {recentDiscussions && recentDiscussions.length > 0 && (
            <div className="mt-8 border-t border-white/5 pt-6">
              <h2 className="font-medium text-paper">Son tartışmaları</h2>
              <div className="mt-3 space-y-2">
                {recentDiscussions.map((d: { id: string; slug: string; title: string; created_at: string }) => (
                  <Link key={d.id} href={`/tartismalar/${d.slug}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-amber/20 hover:bg-white/[0.04]">
                    <span className="truncate text-sm text-zinc-300">{d.title}</span>
                    <span className="shrink-0 text-xs text-zinc-600">{formatDate(d.created_at)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Link href="/tartismalar" className="text-sm text-zinc-500 hover:text-amber">
          Tartışmalara dön →
        </Link>
      </div>
    </main>
  );
}
