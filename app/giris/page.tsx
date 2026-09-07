"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { signIn } from "@/app/auth/actions";

export default function SignInPage() {
  const [state, action, pending] = useActionState(signIn, {});

  return (
    <main className="shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <form action={action} className="panel w-full max-w-md p-8 animate-fadeIn">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-paper">Tekrar hoş geldin</h1>
          <p className="mt-2 text-sm text-zinc-500">Düşünceye kaldığın yerden devam et.</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">E-posta</span>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input name="email" type="email" placeholder="ornek@poleakademi.com" required className="field pl-10" />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">Şifre</span>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input name="password" type="password" placeholder="••••••••" required className="field pl-10" />
            </div>
          </label>

          {state.error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}

          <button disabled={pending} className="button w-full">
            <LogIn size={16} />
            {pending ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/sifremi-unuttum" className="text-zinc-400 hover:text-amber">
            Şifremi unuttum
          </Link>
          <Link href="/kayit" className="font-medium text-amber hover:text-amber/80">
            Kayıt ol →
          </Link>
        </div>

        <p className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-zinc-600">
          Giriş yaparak topluluk ilkelerini kabul etmiş olursun.
        </p>
      </form>
    </main>
  );
}
