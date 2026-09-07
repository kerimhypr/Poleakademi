import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileFormClient } from "@/components/profile-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUser();

  if (!user) redirect("/giris");

  // Profil henüz oluşmamışsa (trigger gecikmesi vb.) fallback göster
  if (!profile) {
    return (
      <main className="shell max-w-2xl py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Hesabın</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-paper">Profilin</h1>
          <p className="mt-2 text-sm text-zinc-500">Bağımsız bir İslam tartışma ve bilgilendirme topluluğunun parçasısın.</p>
        </div>
        <div className="panel p-8 text-center">
          <p className="font-medium text-paper">Profilin hazırlanıyor…</p>
          <p className="mt-2 text-sm text-zinc-500">Hesabın yeni oluşturuldu. Sayfayı yenile veya tekrar giriş yap. Sorun sürerse yöneticine bildir.</p>
          <p className="mt-4 text-xs text-zinc-600">User ID: {user.id}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="shell max-w-2xl py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Hesabın</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-paper">Profilin</h1>
        <p className="mt-2 text-sm text-zinc-500">Bağımsız bir İslam tartışma ve bilgilendirme topluluğunun parçasısın. Profilin ilmi kimliğini yansıtsın.</p>
      </div>
      <ProfileFormClient initialProfile={profile} />
    </main>
  );
}
