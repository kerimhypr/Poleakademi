import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="shell flex min-h-[70vh] items-center justify-center py-16 text-center">
      <div className="max-w-md animate-fadeIn">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber/20 bg-amber/10 text-amber">
          <Compass size={24} />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-amber">404 — Kaybolduk mu?</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-paper">Bu sayfa bulunamadı.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Aradığın yol burada bitiyor. Belki de yeni bir sorunun başlangıcıdır.
        </p>
        <Link href="/" className="button mt-8">
          Ana sayfaya dön
        </Link>
      </div>
    </main>
  );
}
