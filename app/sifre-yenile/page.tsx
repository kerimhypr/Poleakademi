"use client";

import { useActionState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { updatePassword } from "@/app/auth/actions";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, {});

  return (
    <main className="shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <form action={action} className="panel w-full max-w-md p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber/10 text-amber">
          <ShieldCheck size={22} />
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-paper">Yeni şifre</h1>
        <p className="mt-2 text-sm text-zinc-500">Güçlü bir şifre seç, en az 8 karakter.</p>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">Yeni şifre</span>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input name="password" type="password" placeholder="••••••••" minLength={8} required className="field pl-10" />
            </div>
          </label>

          {state.error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}

          <button disabled={pending} className="button w-full">
            {pending ? "Güncelleniyor…" : "Şifreyi güncelle"}
          </button>
        </div>
      </form>
    </main>
  );
}
