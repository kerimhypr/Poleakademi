"use client";

import { useActionState } from "react";
import { Crown, Save } from "lucide-react";
import { assignTitle } from "@/app/profil/actions";

export function TitleForm({ userId, currentTitle }: { userId: string; currentTitle: string | null }) {
  const [state, action, pending] = useActionState(assignTitle, {});

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="relative">
        <Crown size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-amber" />
        <input
          className="field !w-56 !py-2 pl-8 text-sm"
          name="title"
          defaultValue={currentTitle ?? ""}
          maxLength={80}
          placeholder="Unvan ata (örn: Filozof)"
        />
      </div>
      <button className="button !px-3 !py-2 text-xs" disabled={pending}>
        <Save size={14} /> {pending ? "…" : "Kaydet"}
      </button>
      {state.error && <span className="text-xs text-red-400">{state.error}</span>}
      {state.success && <span className="text-xs text-emerald-400">{state.success}</span>}
    </form>
  );
}
