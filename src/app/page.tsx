import type { Metadata } from "next";
import Link from "next/link";

import { FarmBoard } from "@/components/modules/farm-board";
import { listFarmCards } from "@/services/farm.service";

export const metadata: Metadata = {
  // The root layout template does not apply to this same route segment.
  title: { absolute: "Farms · D2R Simulator" },
  description: "Locais de farm do Hell e a Treasure Class de cada chefe.",
};

export default function Home() {
  const farms = listFarmCards();

  return (
    <div className="min-h-full w-full min-w-0 flex-1 overflow-x-hidden bg-[#0c0c0e] text-zinc-100">
      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-[0.18em] text-sky-400 uppercase">Diablo II</p>
            <div className="flex gap-4">
              <Link
                href="/uniques"
                className="text-sm text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
              >
                Itens Únicos
              </Link>
              <Link
                href="/runes"
                className="text-sm text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
              >
                Lista de runas
              </Link>
            </div>
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-diablo)] text-4xl tracking-wide text-zinc-50 uppercase sm:text-5xl">
              Onde farmar
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Seis farms de Hell. Cada card mostra a Treasure Class do chefe, quantos picks ela
              rola, o NoDrop e o peso de cada entrada.
            </p>
          </div>
        </header>
        <FarmBoard farms={farms} />
      </main>
    </div>
  );
}
