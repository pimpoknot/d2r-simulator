import type { FarmCard, FarmTreasureClassView } from "@/server/services/farm.service";
import Link from "next/link";

function picksLabel(picks: number) {
  if (picks < 0) {
    const count = Math.abs(picks);
    return `${count} ${count === 1 ? "item" : "items"}, without repeating the same entry`;
  }

  return `${picks} ${picks === 1 ? "pick" : "picks"}`;
}

function TreasureClassBlock({ treasureClass }: { treasureClass: FarmTreasureClassView }) {
  if (treasureClass.missing) {
    return (
      <p role="alert" className="text-sm text-[#ffb4ab]">
        Treasure Class {treasureClass.name} não está nas tabelas.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-[family-name:var(--font-headline)] font-semibold text-[#e2e5e8]">
          {treasureClass.name}
        </h3>
        <p className="mt-1 text-xs tracking-wide text-[#b2b8c0] uppercase font-[family-name:var(--font-mono-sharp)]">
          {picksLabel(treasureClass.picks)} · NoDrop {treasureClass.noDrop}
        </p>
      </div>
      <ol className="flex flex-col gap-1.5">
        {treasureClass.entries.map((entry, index) => (
          <li
            key={`${treasureClass.name}-${index}`}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span className="min-w-0 text-[#e2e5e8] font-[family-name:var(--font-body)]">{entry.label}</span>
            <span className="shrink-0 font-[family-name:var(--font-mono-sharp)] text-xs text-[#c7b377]">
              {entry.probability}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function FarmBoard({ farms }: { farms: FarmCard[] }) {
  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {farms.map((farm) => {
        const killLabel = farm.killCount === 1 ? "1 kill" : `${farm.killCount} kills`;

        return (
          <li key={farm.slug}>
            <Link href={`/run/${farm.slug}`} className="block h-full group">
              <article className="stone-plate corner-bracket p-0 flex h-full flex-col gap-4 transition-all group-hover:shadow-[0_0_20px_rgba(199,179,119,0.2)]">
                <header className="panel-engraved-header corner-tick px-4 py-3 flex flex-col gap-1">
                  <p className="text-xs tracking-[0.16em] text-[#c7b377]/80 uppercase font-[family-name:var(--font-mono-sharp)]">
                    {farm.area} · {farm.difficulty}
                  </p>
                  <h2 className="font-[family-name:var(--font-headline)] text-2xl tracking-wide text-[#c7b377] uppercase group-hover:text-[#e4ce90] transition-colors font-bold">
                    {farm.name}
                  </h2>
                  <p className="text-sm text-[#b2b8c0] font-[family-name:var(--font-body)]">
                    {farm.note}. {killLabel}: {farm.monsters.join(", ")}.
                  </p>
                </header>

                <div className="px-4 pb-4 flex flex-col gap-4">
                  {farm.treasureClasses.map((treasureClass) => (
                    <TreasureClassBlock key={treasureClass.name} treasureClass={treasureClass} />
                  ))}
                </div>
              </article>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
