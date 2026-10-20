import type { Metadata } from "next";
import { Dancing_Script, Inter, Playfair_Display } from "next/font/google";
import { RaffleProvider } from "@/context/raffle-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const dancing = Dancing_Script({ subsets: ["latin"], variable: "--font-script", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Undian Golden Hours | Gathering SBU HIMPM 2026",
  description: "Aplikasi undian doorprize Gathering SBU HIMPM 2026 di Bumi Gumati, Bogor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}>
      <body>
        <RaffleProvider>{children}</RaffleProvider>
      </body>
    </html>
  );
}
