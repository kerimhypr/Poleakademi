import Link from "next/link";
import { Compass, Library, Users, Sparkles, ArrowRight, BookOpen, Feather, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ kayit?: string }> }) {
  const { kayit } = await searchParams;
  const supabase = await createClient();
  const [{ data: articlesData }, { data: discussionsData }] = await Promise.all([
    supabase.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(6),
    supabase.from("discussions").select("id,slug,title,created_at,author_id").order("created_at", { ascending: false }).limit(6),
  ]);
  const articles = (articlesData ?? []) as Article[];
  const discussions = (discussionsData ?? []) as { id: string; slug: string; title: string; created_at: string; author_id: string }[];

  return (
    <main>
      {kayit === "basarili" && (
        <div className="shell pt-6">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-300">
            Kayıt başarılı! Hoş geldin — ana sayfadasın.
          </div>
        </div>
      )}
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber/[0.04] via-transparent to-transparent" />
        <div className="absolute -top-24 left-1/2 h-[420px] w-[1200px] -translate-x-1/2 rounded-full bg-amber/5 blur-3xl" />

        <div className="shell py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber/[0.08] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber">
              <Compass size={14} className="animate-pulse" />
              Düşüncenin açık alanı
            </span>

            <h1 className="mt-7 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-paper sm:text-6xl">
              Soruların peşinden,
              <span className="block bg-gradient-to-r from-amber via-amber to-zinc-200 bg-clip-text text-transparent"> birlikte.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-zinc-400 sm:text-lg">
              Poleakademi, hiçbir cemaat ve gruba bağlı olmayan <span className="text-zinc-200">bağımsız bir İslam tartışma ve bilgilendirme topluluğudur</span>.
              Felsefe, din ve eleştirel düşünce üzerine ilim ve delil merkezli, saygılı bir müzakere alanı.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/makaleler" className="button">
                <BookOpen size={16} /> Pole&apos;nin Yazıları
              </Link>
              <Link href="/tartismalar" className="button-secondary">
                <MessageCircle size={16} /> Tartışmalara göz at <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 border-y border-white/[0.06] py-6 sm:gap-8">
              {[
                { icon: Library, label: "Makale", value: `${articles.length}` },
                { icon: Users, label: "Topluluk", value: "Açık" },
                { icon: Sparkles, label: "Tartışma", value: "Özgür" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon size={18} className="mx-auto text-amber/70" />
                  <p className="mt-2 font-serif text-xl font-semibold text-paper">{item.value}</p>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pole'nin Yazıları */}
      <section id="pole-yazilari" className="shell pb-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Resmi</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-paper">Pole&apos;nin Yazıları</h2>
            <p className="mt-2 text-sm text-zinc-500">Sadece Pole tarafından paylaşılan resmi yazılar — yorum yapabilir, tartışmaya katılabilirsin ama yeni yazı ekleyemezsin.</p>
          </div>
          <Link href="/makaleler" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-amber hover:text-amber/80">
            Tümünü gör <ArrowRight size={14} />
          </Link>
        </div>

        {articles.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="panel px-6 py-16 text-center sm:px-8">
            <div className="mx-auto max-w-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/10 text-amber">
                <Feather size={24} />
              </div>
              <h3 className="mt-6 font-serif text-2xl font-semibold text-paper">Henüz resmi yazı yok.</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">Pole&apos;nin kaleminden ilk yazı bekleniyor — tertemiz, sahte içerik yok.</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
                <BookOpen size={14} />
                <span>Bağımsız bir İslam tartışma ve bilgilendirme topluluğu olarak yolculuğumuz başlıyor.</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Tartışmalar - Reddit tarzı */}
      <section id="tartismalar" className="shell pb-16 sm:pb-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Topluluk</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-paper">Tartışmalar</h2>
            <p className="mt-2 text-sm text-zinc-500">Reddit tarzı — herkesin açabildiği başlıklar, herkesin yorum yapabildiği özgür alan.</p>
          </div>
          <Link href="/tartismalar" className="button-secondary !px-4 !py-2 text-sm hidden sm:inline-flex">
            Tüm tartışmalar <ArrowRight size={14} />
          </Link>
        </div>

        {discussions.length ? (
          <div className="grid gap-3">
            {discussions.map((d) => (
              <Link key={d.id} href={`/tartismalar/${d.slug}`} className="panel flex items-center justify-between gap-4 p-4 hover:border-amber/20">
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-paper">{d.title}</h3>
                  <p className="mt-1 text-xs text-zinc-500">{new Date(d.created_at).toLocaleDateString("tr-TR")}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-400">Tartışma</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="panel px-6 py-12 text-center">
            <MessageCircle size={28} className="mx-auto text-zinc-700" />
            <h3 className="mt-4 font-medium text-paper">Henüz tartışma yok</h3>
            <p className="mt-2 text-sm text-zinc-500">İlk başlığı sen aç — topluluk seni bekliyor.</p>
            <Link href="/tartismalar/yeni" className="button mt-5">
              Yeni tartışma başlat
            </Link>
          </div>
        )}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link href="/tartismalar" className="button-secondary w-full justify-center">
            Tüm tartışmalar
          </Link>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="shell grid gap-10 py-14 sm:py-20 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Neden Poleakademi</p>
            <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight text-paper">Yavaş düşün, derin oku, nazikçe tartış.</h3>
          </div>
          {[
            {
              title: "Bağımsız & bağlantısız",
              desc: "Hiçbir cemaate, gruba veya yapıya bağlı değiliz. Sadece ilim ve delil.",
            },
            {
              title: "İslam temelli müzakere",
              desc: "Bağımsız bir İslam tartışma ve bilgilendirme topluluğu — Kur'an, Sünnet ve ilmi gelenek ışığında felsefi ve eleştirel düşünce.",
            },
            {
              title: "Saygılı tartışma",
              desc: "İç içe yanıtlar, delile dayalı dil, kalıcı metinler. Gürültü değil, derinlik.",
            },
          ].map((c) => (
            <div key={c.title} className="panel p-6">
              <h4 className="font-medium text-paper">{c.title}</h4>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
