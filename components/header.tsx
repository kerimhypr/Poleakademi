import Link from "next/link";
import { BookOpen, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

export async function Header() {
  const { user, profile } = await getCurrentUser();
  return <header className="border-b border-white/10 bg-ink/80 backdrop-blur"><div className="shell flex h-16 items-center justify-between gap-4"><Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-paper"><BookOpen size={21} className="text-amber" />poleakademi</Link><nav className="flex items-center gap-2 text-sm">{profile?.role === "admin" && <Link className="button-secondary !px-3 !py-2" href="/admin"><LayoutDashboard size={16} /></Link>}{user ? <><Link className="button-secondary !px-3 !py-2" href="/profil"><UserRound size={16} /><span className="hidden sm:inline">Profil</span></Link><form action={signOut}><button aria-label="Çıkış yap" className="button-secondary !px-3 !py-2"><LogOut size={16} /></button></form></> : <Link href="/giris" className="button-secondary !px-3 !py-2">Giriş yap</Link>}</nav></div></header>;
}
