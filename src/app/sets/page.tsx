import type { Metadata } from "next";
import Link from "next/link";

import { UniqueGrid } from "@/components/modules/unique-grid";
import { listSets } from "@/server/repositories/set.repo";
import { getSetItemByName } from "@/constants/d2-tables/load";
import { translateStats } from "@/constants/d2-tables/stats-translator";

export const metadata: Metadata = {
  title: "Set Items",
  description: "Complete list of Diablo II Set items with images.",
};

export default async function SetsPage() {
  let sets: Awaited<ReturnType<typeof listSets>> = [];
  let failed = false;

  try {
    sets = await listSets();
  } catch (cause) {
    failed = true;
    console.error("Failed to list set items", cause);
  }

  return (
    <div className="min-h-full w-full min-w-0 flex-1 overflow-x-hidden bg-[#0c0c0e] text-zinc-100">
      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-fit text-sm text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
          >
            &larr; Back to Home
          </Link>
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-green-500 uppercase">
              The Holy Grail
            </p>
            <h1 className="font-[family-name:var(--font-diablo)] mt-2 text-3xl tracking-wider uppercase text-zinc-50">
              Set Items
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Catálogo completo de itens de conjunto (Set) já salvos no banco de dados.
              Clique num item para ver sua página de origem no Maxroll.
            </p>
          </div>
        </header>

        {failed ? (
          <p
            role="alert"
            className="rounded-md border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            Could not load Set items. Check if the database (Supabase) is accessible.
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-500 font-mono">
              {sets.length} {sets.length === 1 ? "registered item" : "registered items"}
            </p>
            <UniqueGrid 
              items={sets.map(s => {
                const dropData = getSetItemByName(s.name);
                const stats = dropData ? translateStats(dropData.rawProps) : [];
                
                return {
                  ...s,
                  tooltipLines: [
                    { text: dropData?.setName || s.baseType || "Set Item", color: "#00ff00" },
                    ...(stats.length > 0 ? stats.map((stat, i) => ({
                      text: stat.text,
                      color: stat.color,
                      gapBefore: i === 0,
                    })) : [{ text: "Base stats not yet available.", color: "#888888", gapBefore: true }])
                  ]
                };
              })}
              quality="set"
              emptyMessage="No Set items found."
              emptyCommand="npm run db:scrape:sets"
            />
          </>
        )}
      </main>
    </div>
  );
}
