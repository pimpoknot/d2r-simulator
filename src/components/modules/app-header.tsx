"use client";

import Link from "next/link";

export function AppHeader() {
  return (
    <header className="flex justify-between items-center w-full px-4 py-2 border-b border-[#353b44] bg-[#07080a] z-40 relative shadow-2xl">
      {/* Brand / Title */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 stone-recessed flex items-center justify-center border border-[#525c68] text-[#c7b377] font-bold shadow-inner">
          <span className="text-[18px]">⚒</span>
        </div>
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-headline)] font-bold tracking-widest text-[#c7b377] uppercase leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            Sanctuary Lootsmith
          </h1>
          <div className="text-[10px] tracking-widest text-[#b2b8c0] font-[family-name:var(--font-mono-sharp)] uppercase flex items-center gap-2">
            <span>v1.14d Core Engine</span>
            <span className="text-[#353b44]">•</span>
            <span className="text-[#c7b377] flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c7b377] animate-pulse"></span>
              Simulation Active
            </span>
          </div>
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav className="hidden md:flex items-center space-x-6 text-[13px] font-[family-name:var(--font-headline)] font-semibold">
        <Link
          className="text-[#b2b8c0] hover:text-[#c7b377] uppercase tracking-wider transition-colors py-1"
          href="/"
        >
          Farms
        </Link>
        <Link
          className="text-[#b2b8c0] hover:text-[#c7b377] uppercase tracking-wider transition-colors py-1"
          href="/runes"
        >
          Runes
        </Link>
        <Link
          className="text-[#b2b8c0] hover:text-[#c7b377] uppercase tracking-wider transition-colors py-1"
          href="/uniques"
        >
          Uniques
        </Link>
        <Link
          className="text-[#b2b8c0] hover:text-[#c7b377] uppercase tracking-wider transition-colors py-1"
          href="/sets"
        >
          Sets
        </Link>
      </nav>

      {/* Run Controls & Actions */}
      <div className="flex items-center gap-3">
        <button className="d2-button px-4 py-1.5 text-[#c7b377] text-[13px] font-[family-name:var(--font-headline)] font-bold uppercase tracking-wider transition-all">
          Configure
        </button>
        <div className="flex items-center space-x-1 border-l border-[#353b44] pl-3">
          <button
            className="p-1.5 stone-recessed text-[#b2b8c0] hover:text-[#c7b377] hover:border-[#525c68] transition-colors"
            title="Settings"
          >
            <span className="text-[18px]">⚙</span>
          </button>
          <button
            className="p-1.5 stone-recessed text-[#b2b8c0] hover:text-[#c7b377] hover:border-[#525c68] transition-colors"
            title="History"
          >
            <span className="text-[18px]">📜</span>
          </button>
          <button
            className="p-1.5 stone-recessed text-[#b2b8c0] hover:text-[#c7b377] hover:border-[#525c68] transition-colors"
            title="Help"
          >
            <span className="text-[18px]">?</span>
          </button>
        </div>
      </div>
    </header>
  );
}
