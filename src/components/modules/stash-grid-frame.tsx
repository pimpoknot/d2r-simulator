"use client";

import { useStash } from "@/hooks/use-stash";
import { ItemQuality } from "@/server/db/client";
import { ItemTooltip } from "@/components/ui/item-tooltip";
import { useState } from "react";
import Image from "next/image";

export function StashGridFrame({ userId }: { userId?: string }) {
  const { loading, error, filterItems } = useStash(userId);
  const [search, setSearch] = useState("");
  const [qualityFilter, setQualityFilter] = useState<ItemQuality | "ALL">("ALL");

  const displayedItems = filterItems(qualityFilter === "ALL" ? undefined : qualityFilter, search);

  const qualities: (ItemQuality | "ALL")[] = [
    "ALL",
    "NORMAL",
    "MAGIC",
    "RARE",
    "SET",
    "UNIQUE",
    "RUNE",
    "CRAFTED"
  ];

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "MAGIC": return "text-blue-500";
      case "RARE": return "text-yellow-400";
      case "SET": return "text-green-500";
      case "UNIQUE": return "text-amber-500";
      case "RUNE": return "text-[#e25c12]";
      default: return "text-zinc-300";
    }
  };

  // We will display a grid of at least 100 slots (10x10) or more depending on item count
  const totalSlots = Math.max(100, Math.ceil(displayedItems.length / 10) * 10);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141416] p-4 rounded border border-[#2c2c30]">
        <h2 className="font-[family-name:var(--font-diablo)] text-2xl text-amber-500 uppercase">Stash</h2>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search item..." 
            className="bg-[#0c0c0e] text-[#a0a0a0] border border-[#2c2c30] px-3 py-1.5 rounded w-full sm:w-48 outline-none focus:border-amber-400 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="bg-[#0c0c0e] text-[#a0a0a0] border border-[#2c2c30] px-3 py-1.5 rounded outline-none focus:border-amber-400 transition-colors"
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value as ItemQuality | "ALL")}
          >
            {qualities.map(q => (
              <option key={q} value={q}>{q === "ALL" ? "All" : q}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-center py-8 text-[#a0a0a0]">Loading stash...</div>}
      {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="relative bg-[#0c0c0e] border-[3px] border-[#3b3b3b] p-1 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <div className="grid grid-cols-10 gap-[1px] bg-[#222]">
              {Array.from({ length: totalSlots }).map((_, i) => {
                const item = displayedItems[i];

                if (item) {
                  const stats = item.statsPayload as {
                    imageUrl?: string;
                    tooltipLines?: { text: string; color?: string; gapBefore?: boolean }[];
                  };

                  return (
                    <div
                      key={item.id}
                      className="w-12 h-12 bg-black relative flex items-center justify-center border border-[#1a1a1a] hover:bg-zinc-900 transition-colors"
                    >
                      <ItemTooltip
                        item={{
                          name: item.itemName,
                          quality: item.itemQuality.toLowerCase() as any,
                          lines: stats.tooltipLines || []
                        }}
                      >
                        <div className="w-full h-full relative cursor-help flex items-center justify-center p-1">
                          {stats.imageUrl ? (
                            <Image
                              src={stats.imageUrl}
                              alt={item.itemName}
                              fill
                              sizes="48px"
                              className="object-contain p-1 drop-shadow-md"
                            />
                          ) : (
                            <span className={`text-[9px] text-center leading-tight ${getQualityColor(item.itemQuality)}`}>
                              {item.itemName.split(" ")[0]}
                            </span>
                          )}
                        </div>
                      </ItemTooltip>
                    </div>
                  );
                }

                // Empty slot
                return (
                  <div
                    key={`empty-${i}`}
                    className="w-12 h-12 bg-black relative border border-[#1a1a1a]"
                  />
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 flex gap-4 text-xs text-zinc-500 font-mono">
            <span>Items: {displayedItems.length}</span>
            <span>Total Value: {displayedItems.length * 100} Gold</span>
          </div>
        </div>
      )}
    </div>
  );
}
