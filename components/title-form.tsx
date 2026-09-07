"use client";
import { useActionState } from "react";
import { assignTitle } from "@/app/profil/actions";
export function TitleForm({ userId, currentTitle }: { userId: string; currentTitle: string | null }) { const [state, action, pending] = useActionState(assignTitle, {}); return <form action={action} className="flex flex-wrap items-center gap-2"><input type="hidden" name="userId" value={userId} /><input className="field !w-48 !py-2" name="title" defaultValue={currentTitle ?? ""} maxLength={80} placeholder="Unvan ata" /><button className="button !px-3 !py-2" disabled={pending}>{pending ? "…" : "Kaydet"}</button>{state.error && <span className="text-xs text-red-400">{state.error}</span>}{state.success && <span className="text-xs text-emerald-400">Kaydedildi</span>}</form>; }
