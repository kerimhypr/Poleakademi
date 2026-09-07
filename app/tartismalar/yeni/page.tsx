import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DiscussionForm } from "@/components/discussion-form";

export const dynamic = "force-dynamic";

export default async function YeniTartismaPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/giris");

  return (
    <main className="shell max-w-3xl py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Topluluk</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-paper">Yeni tartışma</h1>
        <p className="mt-2 text-sm text-zinc-500">Herkesin açabildiği Reddit tarzı başlık — saygılı, delile dayalı.</p>
      </div>
      <DiscussionForm />
    </main>
  );
}
