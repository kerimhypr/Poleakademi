"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Mail, Send } from "lucide-react";
import { requestPasswordReset } from "@/app/auth/actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, {});

  return (
    <main className="shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <form action={action} className="panel w-full max-w-md p-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-paper">Şifreni yenile</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          E-posta adresini gir. Hesap varsa, yenileme bağlantısı göndereceğiz — güvenlik için sonucu her zaman aynı gösteririz.
        </p>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">E-posta</span>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input name="email" type="email" placeholder="ornek@poleakademi.com" required className="field pl-10" />
            </div>
          </label>

          {state.error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}
          {state.message && <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{state.message}</p>}

          <button disabled={pending} className="button w-full">
            <Send size={16} />
            {pending ? "Gönderiliyor…" : "Bağlantı gönder"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/giris" className="text-amber hover:text-amber/80">
            ← Girişe dön
          </Link>
        </p>
      </form>
    </main>
  );
}
