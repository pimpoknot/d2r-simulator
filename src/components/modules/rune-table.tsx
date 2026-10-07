"use client";

import Image from "next/image";

import { ItemTooltip } from "@/components/ui/item-tooltip";
import { toRuneTooltip } from "@/constants/runes";
import { cn } from "@/lib/utils";

export type RuneRow = {
  id: string;
  name: string;
  slug: string;
  tier: number;
  imagePath: string | null;
  weapon: string | null;
  helmet: string | null;
  armor: string | null;
  shield: string | null;
};

const SLOTS = ["weapon", "helmet", "armor", "shield"] as const;

const BONUS_COLORS: { pattern: RegExp; className: string }[] = [
  { pattern: /poison/i, className: "text-green-400" },
  { pattern: /fire/i, className: "text-red-400" },
  { pattern: /cold/i, className: "text-blue-400" },
  { pattern: /lightning/i, className: "text-yellow-300" },
  { pattern: /mana/i, className: "text-sky-400" },
  { pattern: /life/i, className: "text-rose-300" },
  { pattern: /gold/i, className: "text-amber-300" },
];

function bonusColor(line: string) {
  return BONUS_COLORS.find((rule) => rule.pattern.test(line))?.className;
}

function BonusText({ text }: { text: string | null }) {
  if (!text) {
    return <span className="text-zinc-600">—</span>;
  }

  return (
    <span className="block whitespace-pre-line">
      {text.split("\n").map((line, index) => (
        <span key={`${index}-${line}`} className={cn("block", bonusColor(line))}>
          {line}
        </span>
      ))}
    </span>
  );
}

function slotGroups(rune: RuneRow) {
  const groups: { text: string | null; span: number; start: number }[] = [];

  SLOTS.forEach((slot, index) => {
    const text = rune[slot];
    const last = groups.at(-1);
    if (last && last.text === text) {
      last.span += 1;
    } else {
      groups.push({ text, span: 1, start: index });
    }
  });

  return groups;
}

function RuneIcon({ rune }: { rune: RuneRow }) {
  if (!rune.imagePath?.startsWith("/")) {
    return (
      <span
        aria-hidden
        className="inline-block size-8 shrink-0 rounded-sm bg-zinc-800"
      />
    );
  }

  return (
    <Image
      src={rune.imagePath}
      alt=""
      width={32}
      height={32}
      className="size-8 shrink-0 object-contain"
    />
  );
}

export function RuneTable({ runes }: { runes: RuneRow[] }) {
  if (runes.length === 0) {
    return (
      <p className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-8 text-center text-sm text-zinc-400">
        Nenhuma runa cadastrada.
      </p>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-md border border-zinc-700">
      <table className="w-full min-w-[760px] border-collapse text-center text-sm">
        <caption className="sr-only">
          Bônus das runas em arma, elmo, armadura e escudo
        </caption>
        <thead className="bg-[#141416] text-sky-400">
          <tr>
            <th scope="col" className="w-[18%] px-3 py-3 font-semibold">
              Runa
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              Arma
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              Elmo
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              Armadura
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              Escudo
            </th>
          </tr>
        </thead>
        <tbody>
          {runes.map((rune) => (
            <ItemTooltip key={rune.id} item={toRuneTooltip(rune)}>
              <tr className="border-t border-zinc-800 hover:bg-[#16120e]">
                <th
                  scope="row"
                  className="px-3 py-3 text-left font-medium text-amber-400"
                >
                  <span className="flex items-center gap-2">
                    <RuneIcon rune={rune} />
                    <span>
                      {rune.name} Rune
                      <span className="sr-only">, posição {rune.tier}</span>
                    </span>
                  </span>
                </th>
                {slotGroups(rune).map((group) => (
                  <td
                    key={`${rune.id}-${group.start}`}
                    colSpan={group.span}
                    className="border-l border-zinc-800 px-3 py-3 align-middle text-zinc-100"
                  >
                    <BonusText text={group.text} />
                  </td>
                ))}
              </tr>
            </ItemTooltip>
          ))}
        </tbody>
      </table>
    </div>
  );
}
