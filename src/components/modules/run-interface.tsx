"use client";

import { useState, useCallback } from "react";
import type { FarmCard } from "@/server/services/farm.service";
import { useGameLoop } from "@/hooks/use-game-loop";

interface RunInterfaceProps {
  farm: FarmCard;
}

interface MockDrop {
  id: string;
  name: string;
  quality: string;
}

export function RunInterface({ farm }: RunInterfaceProps) {
  const [isActive, setIsActive] = useState(false);
  const [runTimeMs, setRunTimeMs] = useState(3000); // Default 3s for testing
  const [magicFind, setMagicFind] = useState(0);
  const [playersX, setPlayersX] = useState(1);
  const [drops, setDrops] = useState<MockDrop[]>([]);
  const [runCount, setRunCount] = useState(0);

  const handleRunComplete = useCallback(() => {
    setRunCount((prev) => prev + 1);
    
    // Placeholder mock drop until backend is ready
    const qualities = ["NORMAL", "MAGIC", "RARE", "SET", "UNIQUE"];
    const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
    
    const mockDrop: MockDrop = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Mock Item from ${farm.name}`,
      quality: randomQuality,
    };
    
    setDrops((prev) => [mockDrop, ...prev].slice(0, 50)); // Keep last 50 drops
  }, [farm.name]);

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
      default: return "text-zinc-300";
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
          
          <p className="text-xs text-zinc-500">Runs concluídas: <span className="text-zinc-300">{runCount}</span></p>
        </div>
      </div>

      {/* Drops Panel (Mock) */}
      <div className="w-full lg:w-2/3 border border-zinc-800 bg-zinc-950/80 p-5 rounded-lg flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-diablo)] text-xl text-zinc-50 uppercase border-b border-zinc-800 pb-2">
          Loot Recente (Mock)
        </h2>
        
        {drops.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg p-10">
            <p className="text-zinc-600 text-sm">Nenhum item dropado ainda. Inicie o farm!</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-2">
            {drops.map((drop) => (
              <li 
                key={drop.id} 
                className={`p-3 rounded border border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between animate-in fade-in slide-in-from-top-2`}
              >
                <span className={`text-sm font-medium ${getQualityColor(drop.quality)}`}>
                  {drop.name}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  {drop.quality}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
