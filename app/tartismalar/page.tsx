import Link from "next/link";
import { MessageCircle, Plus, Clock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import type { Discussion } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function TartismalarPage() {
  const supabase = await createClient();
  const [{ data: discussions }, { user }] = await Promise.all([
    supabase.from("discussions").select("*, profiles!discussions_author_id_fkey(id,display_name,avatar_path,title)").order("created_at", { ascending: false }),
    getCurrentUser(),
  ]);

  const list = (discussions ?? []) as (Discussion & { profiles: { id: string; display_name: string; avatar_path: string | null; title: string | null } | null })[];

  return (
    <main className="shell py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Topluluk</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-paper">Tartışmalar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Herkes başlık açabilir, herkes yorum yapabilir. Bağımsız bir İslam tartışma alanı.</p>
        </div>
        {user ? (
          <Link href="/tartismalar/yeni" className="button">
            <Plus size={16} /> Yeni başlık
          </Link>
        ) : (
          <Link href="/giris" className="button-secondary">
            Giriş yap ve tartış
          </Link>
        )}
      </div>

      <section className="mt-10">
        {list.length ? (
          <div className="space-y-3">
            {list.map((d) => (
              <Link key={d.id} href={`/tartismalar/${d.slug}`} className="panel flex gap-4 p-4 hover:border-amber/20 transition-colors">
                <Avatar path={d.profiles?.avatar_path} name={d.profiles?.display_name ?? "Üye"} size="sm" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-medium leading-tight text-paper">{d.title}</h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <User size={12} /> {d.profiles?.display_name ?? "Üye"}
                    </span>
                    {d.profiles?.title && <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs font-semibold text-amber">{d.profiles.title}</span>}
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} /> {new Date(d.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                  <MessageCircle size={12} /> Tartışma
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="panel px-6 py-16 text-center">
            <MessageCircle size={32} className="mx-auto text-zinc-700" />
            <h3 className="mt-4 font-serif text-xl font-semibold text-paper">Henüz tartışma yok</h3>
            <p className="mt-2 text-sm text-zinc-500">İlk başlığı sen aç, topluluk seni bekliyor.</p>
            {user && (
              <Link href="/tartismalar/yeni" className="button mt-6">
                <Plus size={16} /> Yeni tartışma başlat
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
