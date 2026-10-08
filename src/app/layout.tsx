import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    default: "D2R Simulator",
    template: "%s · D2R Simulator",
  },
  description: "Simulador idle de drop do Diablo II: Resurrected.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${diablo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
