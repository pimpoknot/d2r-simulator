import type { Metadata } from "next";
import { FarmBoard } from "@/components/modules/farm-board";
import { listFarmCards } from "@/services/farm.service";
import { AppHeader } from "@/components/modules/app-header";
import { AppFooter } from "@/components/modules/app-footer";

export const metadata: Metadata = {
  title: { absolute: "Farms · Sanctuary Lootsmith" },
  description: "Hell farm locations and their boss Treasure Classes.",
};

export default function Home() {
  const farms = listFarmCards();

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 w-full max-w-[1540px] mx-auto p-4 md:p-6 mb-28">
        <header className="mb-6">
          <div className="flex flex-col gap-2 mb-4">
            <p className="text-xs font-[family-name:var(--font-mono-sharp)] tracking-[0.18em] text-[#c7b377] uppercase">
              Diablo II: Resurrected
            </p>
            <h1 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl tracking-wide text-[#c7b377] uppercase font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Where to Farm
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b2b8c0] font-[family-name:var(--font-body)]">
              Six Hell farms. Each card shows the boss Treasure Class, how many picks it rolls, the NoDrop, and the weight of each entry.
            </p>
          </div>
        </header>

        <FarmBoard farms={farms} />
      </main>

      <AppFooter />
    </div>
  );
}
