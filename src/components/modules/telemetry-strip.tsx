"use client";

import { useState } from "react";

export function TelemetryStrip() {
  const [magicFind, setMagicFind] = useState(350);
  const [playersX, setPlayersX] = useState(8);

  return (
    <section className="bg-[#111316] border-b border-[#353b44] px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-sm shadow-md">
      {/* Location Dropdown */}
      <div className="flex items-center gap-3">
        <label className="text-[#b2b8c0] font-[family-name:var(--font-headline)] text-[11px] uppercase tracking-widest flex items-center gap-1">
          <span className="text-[15px] text-[#c7b377]">🧭</span> Target Domain:
        </label>
        <div className="relative">
          <select className="stone-recessed text-[#c7b377] font-[family-name:var(--font-headline)] text-sm px-3 py-1 pr-7 border border-[#353b44] bg-[#07080a] focus:border-[#c7b377] focus:outline-none rounded-none cursor-pointer">
            <option value="chaos">Chaos Sanctuary - Diablo (Hell)</option>
            <option value="travincal">Travincal - High Council (Hell)</option>
            <option value="baal">Worldstone Keep - Baal (Hell)</option>
            <option value="mephisto">Durance of Hate - Mephisto (Hell)</option>
            <option value="pit">The Pit - Level 2 (Tamoe)</option>
            <option value="ancient">Ancient Tunnels (Lost City)</option>
          </select>
          <span className="text-[14px] text-[#525c68] absolute right-1.5 top-2 pointer-events-none">
            ▼
          </span>
        </div>
      </div>

      {/* Magic Find Controller */}
      <div className="flex items-center gap-3">
        <span className="text-[#b2b8c0] font-[family-name:var(--font-headline)] text-[11px] uppercase tracking-widest flex items-center gap-1">
          <span className="text-[15px] text-[#c7b377]">✨</span> Magic Find:
        </span>
        <div className="flex items-center border border-[#353b44] bg-[#07080a]">
          <button
            className="px-2 py-0.5 text-[#b2b8c0] hover:text-[#c7b377] hover:bg-[#181a1d] active:bg-black font-bold border-r border-[#353b44]"
            onClick={() => setMagicFind((prev) => Math.max(0, prev - 25))}
          >
            -
          </button>
          <span className="px-3 font-[family-name:var(--font-mono-sharp)] text-[#c7b377] font-bold text-sm tracking-wider">
            {magicFind}%
          </span>
          <button
            className="px-2 py-0.5 text-[#b2b8c0] hover:text-[#c7b377] hover:bg-[#181a1d] active:bg-black font-bold border-l border-[#353b44]"
            onClick={() => setMagicFind((prev) => Math.min(999, prev + 25))}
          >
            +
          </button>
        </div>
      </div>

      {/* Players X Difficulty */}
      <div className="flex items-center gap-2">
        <span className="text-[#b2b8c0] font-[family-name:var(--font-headline)] text-[11px] uppercase tracking-widest">
          Difficulty:
        </span>
        <div className="flex border border-[#353b44] bg-[#07080a] p-0.5">
          {[1, 3, 5, 8].map((p) => (
            <button
              key={p}
              className={`px-2 py-0.5 text-[11px] font-[family-name:var(--font-mono-sharp)] transition-colors ${
                playersX === p
                  ? "bg-[#1f2329] text-[#c7b377] font-bold border border-[#525c68]"
                  : "text-[#b2b8c0] hover:text-[#c7b377]"
              }`}
              onClick={() => setPlayersX(p)}
            >
              P{p}
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry Badges */}
      <div className="flex items-center gap-4 text-xs font-[family-name:var(--font-mono-sharp)] text-[#b2b8c0]">
        <div>
          Runs: <span className="text-[#e2e5e8] font-bold">1,482</span>
        </div>
        <div>
          Clear: <span className="text-[#00ff00] font-bold">18.4s avg</span>
        </div>
        <div>
          MF Bonus: <span className="text-[#c7b377] font-bold">+185% Uniques</span>
        </div>
      </div>
    </section>
  );
}
