"use client";

import Image from "next/image";
import { ItemTooltip } from "@/components/ui/item-tooltip";

interface UniqueItemView {
  id: string;
  name: string;
  baseType: string | null;
  imageUrl: string | null;
  pageUrl: string;
  tooltipLines: { text: string; color?: string; gapBefore?: boolean }[];
}

interface UniqueGridProps {
  uniques: UniqueItemView[];
}

export function UniqueGrid({ uniques }: UniqueGridProps) {
  if (uniques.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-lg">
        <p className="text-zinc-500 mb-2">Nenhum item Único encontrado.</p>
        <p className="text-xs text-zinc-600">Rode o comando <code className="text-amber-500 font-mono">npm run db:scrape:uniques</code></p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {uniques.map((item) => (
        <ItemTooltip
          key={item.id}
          item={{
            name: item.name,
            quality: "unique",
            lines: item.tooltipLines,
          }}
        >
          <a
            href={item.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3 rounded-lg border border-zinc-800/50 bg-[#141416] hover:bg-zinc-900/80 transition-colors cursor-help group"
          >
            <div className="relative w-12 h-12 flex-shrink-0 bg-zinc-950/50 rounded flex items-center justify-center overflow-hidden border border-zinc-800 group-hover:border-amber-900/50 transition-colors">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-contain p-1 drop-shadow-md"
                />
              ) : (
                <span className="text-zinc-700 text-xs">?</span>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-amber-500 truncate group-hover:text-amber-400 transition-colors">
                {item.name}
              </span>
              {item.baseType && (
                <span className="text-xs text-zinc-500 truncate">
                  {item.baseType}
                </span>
              )}
            </div>
          </a>
        </ItemTooltip>
      ))}
    </div>
  );
}
