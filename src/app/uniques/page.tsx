import type { Metadata } from "next";
import Link from "next/link";

import { UniqueGrid } from "@/components/modules/unique-grid";
import { listUniques } from "@/server/repositories/unique.repo";
import { getUniqueItemByName } from "@/constants/d2-tables/load";
import { translateStats } from "@/constants/d2-tables/stats-translator";

export const metadata: Metadata = {
  title: "Unique Items",
  description: "Complete list of Diablo II Unique items with images.",
};

export default async function UniquesPage() {
  let uniques: Awaited<ReturnType<typeof listUniques>> = [];
  let failed = false;

  try {
    uniques = await listUniques();
  } catch (cause) {
    failed = true;
    console.error("Failed to list unique items", cause);
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
            <p className="text-xs font-medium tracking-[0.18em] text-amber-500 uppercase">
              The Holy Grail
            </p>
            <h1 className="font-[family-name:var(--font-diablo)] mt-2 text-3xl tracking-wider uppercase text-zinc-50">
              Itens Únicos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Catálogo completo de itens únicos já salvos no banco de dados.
              Clique num item para ver sua página de origem no Maxroll.
            </p>
          </div>
        </header>

        {failed ? (
          <p
            role="alert"
            className="rounded-md border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            Could not load Unique items. Check if the database (Supabase) is accessible.
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-500 font-mono">
              {uniques.length} {uniques.length === 1 ? "registered item" : "registered items"}
            </p>
            <UniqueGrid 
              items={uniques.map(u => {
                const dropData = getUniqueItemByName(u.name);
                const stats = dropData ? translateStats(dropData.rawProps) : [];
                
                return {
                  ...u,
                  tooltipLines: [
                    { text: u.baseType || "Item", color: "#ffffff" },
                    ...(stats.length > 0 ? stats.map((s, i) => ({
                      text: s.text,
                      color: s.color,
                      gapBefore: i === 0,
                    })) : [{ text: "Base stats not yet available.", color: "#888888", gapBefore: true }])
                  ]
                };
              })}
              quality="unique"
              emptyMessage="No Unique items found."
              emptyCommand="npm run db:scrape:uniques"
            />
          </>
        )}
      </main>
    </div>
  );
}
