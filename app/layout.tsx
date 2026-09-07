import type { Metadata } from "next";
import { Literata, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const literata = Literata({ subsets: ["latin"], variable: "--font-literata", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Poleakademi — Düşüncenin Açık Alanı",
    template: "%s | Poleakademi",
  },
  description:
    "Felsefe, din ve eleştirel düşünce üzerine derinlikli makaleler, tartışmalar ve akademik bir topluluk. Soruların peşinden, birlikte.",
  keywords: ["felsefe", "din", "eleştirel düşünce", "akademi", "makale", "tartışma"],
  authors: [{ name: "Poleakademi" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Poleakademi",
    title: "Poleakademi — Düşüncenin Açık Alanı",
    description: "Felsefe, din ve eleştirel düşünce için sade bir akademi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poleakademi",
    description: "Felsefe, din ve eleştirel düşünce için sade bir akademi.",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://poleakademi.onrender.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${literata.variable} ${mono.variable} dark`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-white/[0.06] py-10">
          <div className="shell">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="font-serif text-base font-semibold text-zinc-300">poleakademi</span>
                <span className="h-3 w-px bg-white/10" />
                <span>© {new Date().getFullYear()} Düşüncenin açık alanı.</span>
              </div>
              <div className="flex items-center gap-6 text-xs tracking-wide text-zinc-500">
                <span className="hidden sm:inline">Felsefe · Din · Eleştirel Düşünce</span>
                <span className="h-3 w-px bg-white/10 hidden sm:block" />
                <span>Topluluk odaklı · Reklamsız · Bağımsız</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
