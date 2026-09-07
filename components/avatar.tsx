import { UserRound } from "lucide-react";

export function Avatar({ path, name, size = "md" }: { path?: string | null; name: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-20 w-20" : "h-10 w-10";
  const url = path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}` : null;
  return url ? <img className={`${dim} shrink-0 rounded-full object-cover`} src={url} alt={`${name} profil fotoğrafı`} /> : <span className={`${dim} inline-flex shrink-0 items-center justify-center rounded-full bg-white/10 text-zinc-400`}><UserRound size={size === "lg" ? 30 : 18} /></span>;
}
