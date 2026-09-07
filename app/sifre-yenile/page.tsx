"use client";
import { useActionState } from "react";
import { updatePassword } from "@/app/auth/actions";
export default function ResetPasswordPage() { const [state, action, pending] = useActionState(updatePassword, {}); return <main className="shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-12"><form action={action} className="panel w-full max-w-md p-7"><h1 className="font-serif text-3xl text-paper">Yeni şifre</h1><div className="mt-7 space-y-4"><input name="password" className="field" type="password" placeholder="En az 8 karakter" minLength={8} required />{state.error && <p className="text-sm text-red-400">{state.error}</p>}<button disabled={pending} className="button w-full">{pending ? "Güncelleniyor…" : "Şifreyi güncelle"}</button></div></form></main>; }
