import type { Metadata } from "next";
import { EB_Garamond, Cinzel, Domine, Share_Tech_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const ebGaramond = EB_Garamond({
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const cinzel = Cinzel({
  weight: ["600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-headline-alt",
  display: "swap",
});

const domine = Domine({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-mono-sharp",
  display: "swap",
});

const diablo = localFont({
  src: "../../public/diablo.ttf",
  weight: "900",
  variable: "--font-diablo",
  fallback: ["Times New Roman", "serif"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sanctuary Lootsmith · D2R Simulator",
    template: "%s · Sanctuary Lootsmith",
  },
  description: "Idle farming loot simulator for Diablo II: Resurrected.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${ebGaramond.variable} ${cinzel.variable} ${domine.variable} ${shareTechMono.variable} ${diablo.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col gothic-chassis select-none overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
