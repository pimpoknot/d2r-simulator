"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { FarmCard } from "@/server/services/farm.service";
import { useGameLoop } from "@/hooks/use-game-loop";
import { ItemTooltip, type ItemQuality } from "@/components/ui/item-tooltip";
import Image from "next/image";

interface RunInterfaceProps {
  farm: FarmCard;
}

interface DroppedItem {
  id: string;
  itemType: string;
  name: string;
  quality: string;
  baseCode?: string;
  imageUrl?: string | null;
}

export function RunInterface({ farm }: RunInterfaceProps) {
  const [isActive, setIsActive] = useState(false);
  const [runTimeMs, setRunTimeMs] = useState(3000); // Default 3s for testing
  const [magicFind, setMagicFind] = useState(0);
  const [playersX, setPlayersX] = useState(1);
  const [drops, setDrops] = useState<DroppedItem[]>([]);
  const [runCount, setRunCount] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Refs to avoid stale closures in the callback
  const magicFindRef = useRef(magicFind);
  const playersXRef = useRef(playersX);
  
  useEffect(() => {
    magicFindRef.current = magicFind;
    playersXRef.current = playersX;
  }, [magicFind, playersX]);

  const handleRunComplete = useCallback(async () => {
    setRunCount((prev) => prev + 1);
    setIsSimulating(true);

    try {
      const res = await fetch("/api/drops/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: farm.slug,
          playersX: playersXRef.current,
          magicFind: magicFindRef.current,
        }),
      });

      if (!res.ok) return;

      const json = (await res.json()) as {
        success: boolean;
        data?: {
          drops: Array<{
            itemType: string;
            name: string;
            quality: string;
            baseCode?: string;
            imageUrl?: string | null;
          }>;
        };
      };

      if (json.success && json.data?.drops) {
        const newDrops: DroppedItem[] = json.data.drops.map((d) => ({
          id: Math.random().toString(36).slice(2, 11),
          itemType: d.itemType,
          name: d.name,
          quality: d.quality,
          baseCode: d.baseCode,
          imageUrl: d.imageUrl,
        }));

        setDrops((prev) => [...newDrops, ...prev].slice(0, 100));
      }
    } catch {
      // Network error — silently skip this run
    } finally {
      setIsSimulating(false);
    }
  }, [farm.slug]);

  const { progress, timeLeftSeconds } = useGameLoop({
    runTimeMs,
    onRunComplete: handleRunComplete,
    isActive,
  });

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

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case "MAGIC": return "Mágico";
      case "RARE": return "Raro";
      case "SET": return "Set";
      case "UNIQUE": return "Único";
      case "RUNE": return "Runa";
      case "NORMAL": return "Normal";
      default: return quality;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Settings & Timer Panel */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="border border-zinc-800 bg-zinc-950/80 p-5 rounded-lg flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-diablo)] text-xl text-zinc-50 uppercase border-b border-zinc-800 pb-2">
            Configurações
          </h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400">Tempo por Run (ms)</label>
            <input 
              type="number" 
              value={runTimeMs} 
              onChange={(e) => setRunTimeMs(Number(e.target.value))}
              disabled={isActive}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-200 outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400">Magic Find (%)</label>
            <input 
              type="number" 
              value={magicFind} 
              onChange={(e) => setMagicFind(Number(e.target.value))}
              disabled={isActive}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-200 outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400">Players X (1-8)</label>
            <input 
              type="number" 
              min="1" max="8"
              value={playersX} 
              onChange={(e) => setPlayersX(Number(e.target.value))}
              disabled={isActive}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-200 outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <button 
            onClick={() => setIsActive(!isActive)}
            className={`mt-2 py-3 rounded-md font-[family-name:var(--font-diablo)] tracking-wider uppercase transition-colors ${
              isActive 
                ? "bg-red-950/40 text-red-400 border border-red-900 hover:bg-red-900/40" 
                : "bg-amber-900/20 text-amber-500 border border-amber-900 hover:bg-amber-900/40"
            }`}
          >
            {isActive ? "Parar Farm" : "Iniciar Farm"}
          </button>
        </div>

        {/* Timer UI */}
        <div className="border border-zinc-800 bg-zinc-950/80 p-5 rounded-lg flex flex-col items-center gap-4">
          <p className="text-sm text-zinc-500 font-medium tracking-widest uppercase">Timer</p>
          <div className="text-5xl font-mono text-zinc-100">{timeLeftSeconds}s</div>
          
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-amber-600 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>Runs: <span className="text-zinc-300">{runCount}</span></span>
            {isSimulating && (
              <span className="text-amber-500 animate-pulse">Simulando...</span>
            )}
          </div>
        </div>
      </div>

      {/* Drops Panel */}
      <div className="w-full lg:w-2/3 border border-zinc-800 bg-zinc-950/80 p-5 rounded-lg flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-diablo)] text-xl text-zinc-50 uppercase border-b border-zinc-800 pb-2">
          Loot Recente
        </h2>
        
        {drops.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg p-10">
            <p className="text-zinc-600 text-sm">Nenhum item dropado ainda. Inicie o farm!</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-2">
            {drops.map((drop) => (
              <ItemTooltip
                key={drop.id}
                item={{
                  name: drop.name,
                  quality: drop.quality.toLowerCase() as ItemQuality,
                  lines: [
                    {
                      text: drop.quality === "RUNE" 
                        ? "Pode ser inserida em engastes." 
                        : `Base: ${drop.baseCode || "Desconhecida"}`,
                      color: "#6969ff"
                    },
                    { text: "Atributos reais ainda não carregados.", color: "#888888", gapBefore: true }
                  ]
                }}
              >
                <li 
                  className={`p-2 rounded border border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between animate-in fade-in slide-in-from-top-2 cursor-help`}
                >
                  <div className="flex items-center gap-3">
                    {drop.imageUrl ? (
                      <div className="relative w-10 h-10 bg-zinc-950 rounded flex items-center justify-center overflow-hidden border border-zinc-800">
                        {/* maxroll images might be large, use contain */}
                        <Image 
                          src={drop.imageUrl} 
                          alt={drop.name} 
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-xs text-zinc-700">
                        ?
                      </div>
                    )}
                    <span className={`text-sm font-medium ${getQualityColor(drop.quality)}`}>
                      {drop.name}
                    </span>
                  </div>
                  <span className={`text-xs font-mono ${getQualityColor(drop.quality)} opacity-70`}>
                    {getQualityLabel(drop.quality)}
                  </span>
                </li>
              </ItemTooltip>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
