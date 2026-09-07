export function slugify(value: string) {
  return value.toLocaleLowerCase("tr-TR").trim()
    .replace(/[ıİ]/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatDate(date: string | null) {
  if (!date) return "Taslak";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(date));
}
