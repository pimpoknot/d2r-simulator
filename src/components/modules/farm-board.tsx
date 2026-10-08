import type { FarmCard, FarmTreasureClassView } from "@/server/services/farm.service";
import Link from "next/link";

function picksLabel(picks: number) {
  if (picks < 0) {
    const count = Math.abs(picks);
    return `${count} ${count === 1 ? "item" : "itens"}, sem repetir a mesma entrada`;
  }

  return `${picks} ${picks === 1 ? "pick" : "picks"}`;
}

function TreasureClassBlock({ treasureClass }: { treasureClass: FarmTreasureClassView }) {
  if (treasureClass.missing) {
    return (
      <p role="alert" className="text-sm text-red-200">
        Treasure Class {treasureClass.name} não está nas tabelas.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">{treasureClass.name}</h3>
        <p className="mt-1 text-xs tracking-wide text-zinc-500 uppercase">
          {picksLabel(treasureClass.picks)} · NoDrop {treasureClass.noDrop}
        </p>
      </div>
      <ol className="flex flex-col gap-1.5">
        {treasureClass.entries.map((entry, index) => (
          <li
            key={`${treasureClass.name}-${index}`}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span className="min-w-0 text-zinc-300">{entry.label}</span>
            <span className="shrink-0 font-mono text-xs text-amber-200/90">{entry.probability}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function FarmBoard({ farms }: { farms: FarmCard[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {farms.map((farm) => {
        const killLabel = farm.killCount === 1 ? "1 morte" : `${farm.killCount} mortes`;

        return (
          <li key={farm.slug}>
            <Link href={`/run/${farm.slug}`} className="block h-full group">
              <article className="flex h-full flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 transition-colors group-hover:border-zinc-700 group-hover:bg-zinc-900/80">
                <header className="flex flex-col gap-1">
                  <p className="text-xs tracking-[0.16em] text-amber-200/80 uppercase">
                    {farm.area} · {farm.difficulty}
                  </p>
                  <h2 className="font-[family-name:var(--font-diablo)] text-2xl tracking-wide text-zinc-50 uppercase group-hover:text-amber-400 transition-colors">
                    {farm.name}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {farm.note}. {killLabel}: {farm.monsters.join(", ")}.
                  </p>
                </header>
                {farm.treasureClasses.map((treasureClass) => (
                  <TreasureClassBlock key={treasureClass.name} treasureClass={treasureClass} />
                ))}
              </article>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
