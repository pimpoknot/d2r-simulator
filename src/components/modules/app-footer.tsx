"use client";

export function AppFooter() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-6 py-2 border-t-2 border-[#353b44] bg-[#07080a] shadow-2xl">
      {/* LEFT: Life Orb */}
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-[#15181d] border-2 border-[#454f5c] shadow-[0_0_20px_rgba(0,0,0,0.95)] flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#525c68]/60 pointer-events-none"></div>
          <div className="w-full h-full rounded-full orb-life relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 orb-glass-shine"></div>
            <span className="relative z-10 font-[family-name:var(--font-headline)] text-xs md:text-sm font-bold text-white tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              LIFE
            </span>
            <span className="relative z-10 font-[family-name:var(--font-mono-sharp)] text-[10px] md:text-xs text-white/90 font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              2,410 / 2,410
            </span>
          </div>
        </div>

        {/* Potion Belt */}
        <div className="hidden sm:flex flex-col gap-1">
          <span className="text-[9px] font-[family-name:var(--font-mono-sharp)] text-[#525c68] tracking-wider uppercase">
            Potions
          </span>
          <div className="flex gap-1">
            {[
              { slot: "1", color: "red", label: "Super Healing" },
              { slot: "2", color: "blue", label: "Super Mana" },
              { slot: "3", color: "purple", label: "Full Rejuvenation" },
              { slot: "4", color: "purple", label: "Full Rejuvenation" },
            ].map((potion) => (
              <div
                key={potion.slot}
                className="w-7 h-9 stone-recessed border border-[#353b44] flex flex-col justify-between items-center p-0.5"
                title={`Slot ${potion.slot}: ${potion.label}`}
              >
                <span className="text-[8px] font-[family-name:var(--font-mono-sharp)] text-[#525c68]">
                  {potion.slot}
                </span>
                <div
                  className={`w-3.5 h-4 rounded-sm border shadow-inner ${potion.color === "red"
                    ? "bg-red-700 border-red-500"
                    : potion.color === "blue"
                      ? "bg-blue-700 border-blue-500"
                      : "bg-purple-700 border-purple-400"
                    }`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER: Action Controls */}
      <div className="flex flex-col items-center gap-1.5 max-w-2xl w-full px-2">
        {/* Experience Bar */}
        <div
          className="w-full max-w-md h-2 stone-recessed border border-[#353b44] flex gap-0.5 p-0.5"
          title="Level 94: 87.4% to Level 95"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i < 7
                ? "bg-[#c7b377] shadow-[0_0_4px_#c7b377]"
                : i === 7
                  ? "bg-[#c7b377]/80"
                  : "bg-[#1f2329]"
                }`}
            ></div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center">
          <a href="/" className="d2-button px-6 py-2 border-2 border-[#c7b377] text-[#c7b377] font-[family-name:var(--font-headline)] text-sm md:text-base font-bold tracking-widest uppercase shadow-[0_0_14px_rgba(199,179,119,0.35)] transition-transform no-underline inline-block">
            Start Farming
          </a>

          <div className="flex items-center gap-1 border border-[#353b44] bg-[#07080a] p-1">
            <a
              className="flex flex-col items-center justify-center text-[#c7b377] font-bold uppercase tracking-widest border border-[#525c68] bg-[#181a1d] px-3 py-1 text-xs no-underline"
              href="/"
            >
              Inventory
            </a>
            <a
              className="flex flex-col items-center justify-center text-[#b2b8c0] uppercase tracking-wider px-3 py-1 hover:text-[#c7b377] transition-colors text-xs no-underline"
              href="/stash"
            >
              Stash
            </a>
            <a
              className="flex flex-col items-center justify-center text-[#b2b8c0] uppercase tracking-wider px-3 py-1 hover:text-[#c7b377] transition-colors text-xs no-underline"
              href="/runes"
            >
              Runes
            </a>
          </div>

          <a href="/stash" className="d2-button px-3.5 py-1.5 text-[#e2e5e8] text-[13px] font-[family-name:var(--font-headline)] font-bold uppercase tracking-wider hidden sm:block no-underline inline-block">
            Open Stash
          </a>
        </div>
      </div>

      {/* RIGHT: Mana Orb */}
      <div className="flex items-center gap-3">
        {/* Offline Pool Info */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[9px] font-[family-name:var(--font-mono-sharp)] text-[#525c68] tracking-wider uppercase">
            Offline Pool
          </span>
          <span className="font-[family-name:var(--font-mono-sharp)] text-xs text-[#cbcbff] font-bold">
            8h 45m Pool
          </span>
          <span className="text-[9px] text-[#00ff00] font-[family-name:var(--font-mono-sharp)]">
            Active +100% Rate
          </span>
        </div>

        {/* Mana Globe */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-[#10141b] border-2 border-[#384558] shadow-[0_0_20px_rgba(0,0,0,0.95)] flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#525c68]/60 pointer-events-none"></div>
          <div className="w-full h-full rounded-full orb-mana relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 orb-glass-shine"></div>
            <span className="relative z-10 font-[family-name:var(--font-headline)] text-xs md:text-sm font-bold text-white tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              MANA
            </span>
            <span className="relative z-10 font-[family-name:var(--font-mono-sharp)] text-[10px] md:text-xs text-white/90 font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              1,120 / 1,120
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
