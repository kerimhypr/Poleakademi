import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { TitleForm } from "@/components/title-form";
import type { Profile } from "@/lib/types";
import { Crown, Shield, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const { user } = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  const members = (data ?? []) as Profile[];

  return (
    <main className="shell py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Yönetim alanı</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-paper">Üyeler ve unvanlar</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Üyeler kendi unvanlarını değiştiremez. Yalnızca yöneticiler unvan atayabilir veya kaldırabilir. Örn: Çaylak, Filozof, Ateşli Tartışmacı.
        </p>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-2 px-1 text-xs text-zinc-500">
          <UsersSmall /> Toplam {members.length} üye
        </div>
        {members.map((member) => (
          <article key={member.id} className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar path={member.avatar_path} name={member.display_name} />
              <div>
                <p className="flex items-center gap-2 font-medium text-paper">
                  {member.display_name}
                  {member.id === user.id && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">sen</span>}
                  {member.role === "admin" && <Shield size={14} className="text-amber" />}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                  {member.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 text-amber">
                      <Crown size={12} /> Yönetici
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <User size={12} /> Üye
                    </span>
                  )}
                  <span className="mx-1">·</span>
                  <span className="truncate">{member.title || "Unvan yok"}</span>
                </p>
              </div>
            </div>
            <TitleForm userId={member.id} currentTitle={member.title} />
          </article>
        ))}
        {!members.length && <p className="py-10 text-center text-sm text-zinc-500">Henüz üye yok.</p>}
      </div>
    </main>
  );
}

function UsersSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
