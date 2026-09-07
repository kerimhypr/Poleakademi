import { UserRound } from "lucide-react";

export function Avatar({ path, name, size = "md" }: { path?: string | null; name: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-16 w-16 text-lg" : "h-10 w-10 text-sm";
  const url = path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}` : null;

  if (url) {
    return <img className={`${dim} shrink-0 rounded-full object-cover ring-1 ring-white/10`} src={url} alt={`${name} profil fotoğrafı`} />;
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <span className={`${dim} inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 font-medium text-zinc-300 ring-1 ring-white/10`}>
      {initials || <UserRound size={size === "lg" ? 24 : 16} />}
    </span>
  );
}
