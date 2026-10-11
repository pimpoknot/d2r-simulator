import type { Metadata } from "next";
import Link from "next/link";

import { UniqueGrid } from "@/components/modules/unique-grid";
import { listSets } from "@/server/repositories/set.repo";
import { getSetItemByName } from "@/constants/d2-tables/load";
import { translateStats } from "@/constants/d2-tables/stats-translator";
import { db } from "@/server/db/client";
import { getDefaultUserId } from "@/server/repositories/user.repo";

export const metadata: Metadata = {
  title: "Set Items",
  description: "Complete list of Diablo II Set items with images.",
};

export default async function SetsPage() {
  let sets: Awaited<ReturnType<typeof listSets>> = [];
  let collectedIds = new Set<string>();
  let failed = false;

  try {
    sets = await listSets();
    const userId = await getDefaultUserId();
    const grails = await db.holyGrail.findMany({
      where: { userId },
      select: { uniqueItemId: true }
    });
    collectedIds = new Set(grails.map(g => g.uniqueItemId));
  } catch (cause) {
    failed = true;
    console.error("Failed to list set items", cause);
  }

  const collectedCount = Array.from(collectedIds).filter(id => sets.some(s => s.id === id)).length;
  const percentage = sets.length > 0 ? ((collectedCount / sets.length) * 100).toFixed(1) : "0.0";

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
              Complete catalog of Set items saved in the database.
              Click on an item to view its source page on Maxroll.
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
            <div className="flex items-center gap-4 p-4 border border-zinc-800 bg-zinc-950/50 rounded-lg">
              <div className="flex-1 w-full bg-zinc-900 rounded-full h-4 overflow-hidden border border-zinc-800">
                <div 
                  className="bg-green-600 h-full transition-all duration-500" 
                  style={{ width: `${percentage}%` }} 
                />
              </div>
              <div className="text-sm font-mono text-zinc-300 whitespace-nowrap">
                {collectedCount} / {sets.length} ({percentage}%)
              </div>
            </div>

            <UniqueGrid 
              items={sets.map(s => {
                const dropData = getSetItemByName(s.name);
                const stats = dropData ? translateStats(dropData.rawProps) : [];
                
                return {
                  ...s,
                  collected: collectedIds.has(s.id),
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
