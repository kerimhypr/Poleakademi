import type { Metadata } from "next";
import { Literata, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const literata = Literata({ subsets: ["latin"], variable: "--font-literata" });
export const metadata: Metadata = { title: "poleakademi", description: "Felsefe, din ve eleştirel düşünce için bir buluşma noktası." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="tr" className={`${inter.variable} ${literata.variable}`}><body><Header />{children}</body></html>; }
