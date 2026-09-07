"use client";

import Link from "next/link";
import { useActionState } from "react";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import { signUp } from "@/app/auth/actions";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, {});

  return (
    <main className="shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <form action={action} className="panel w-full max-w-md p-8 animate-fadeIn">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-paper">Akademiye katıl</h1>
          <p className="mt-2 text-sm text-zinc-500">Birkaç saniyede üye ol, tartışmaya katıl.</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">Görünen ad</span>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input name="displayName" placeholder="Örn: Aristoteles" required minLength={2} maxLength={60} className="field pl-10" />
            </div>
          </label>

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
              <input name="password" type="password" placeholder="En az 8 karakter" required minLength={8} className="field pl-10" />
            </div>
          </label>

          {state.error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}
          {state.message && <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{state.message}</p>}

          <button disabled={pending} className="button w-full">
            <UserPlus size={16} />
            {pending ? "Oluşturuluyor…" : "Hesap oluştur"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-medium text-amber hover:text-amber/80">
            Giriş yap
          </Link>
        </p>
      </form>
    </main>
  );
}
