import Link from "next/link";
export default function NotFound() { return <main className="shell flex min-h-[70vh] items-center justify-center text-center"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber">404</p><h1 className="mt-3 font-serif text-4xl text-paper">Bu sayfa bulunamadı.</h1><Link href="/" className="button mt-7">Ana sayfaya dön</Link></div></main>; }
