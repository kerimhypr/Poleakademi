import Link from "next/link";
import { BookOpen, LayoutDashboard, LogOut, UserRound, Feather } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

export async function Header() {
  const { user, profile } = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink/70 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber text-ink">
            <BookOpen size={16} />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-paper group-hover:text-amber transition-colors">
            poleakademi
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-500 ml-1">
            <Feather size={10} /> akademi
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link href="/makaleler" className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-100">
            <BookOpen size={14} /> Pole&apos;nin Yazıları
          </Link>
          <Link href="/tartismalar" className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10">
            Tartışmalar
          </Link>
          {profile?.role === "admin" && (
            <Link href="/admin" className="button-secondary !px-3 !py-2 text-xs">
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Yönetim</span>
            </Link>
          )}

          {user ? (
            <>
              <Link href="/profil" className="button-secondary !px-3 !py-2">
                <UserRound size={16} />
                <span className="hidden sm:inline">Profil</span>
              </Link>
              <form action={signOut}>
                <button aria-label="Çıkış yap" className="button-ghost !p-2.5">
                  <LogOut size={16} />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/giris" className="button-ghost hidden sm:inline-flex">
                Giriş yap
              </Link>
              <Link href="/kayit" className="button !px-4 !py-2 text-sm">
                Kayıt ol
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
