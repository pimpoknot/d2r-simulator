import {
  ITEM_REQUIREMENT_COLOR,
  type ItemTooltipItem,
} from "@/constants/item-tooltip";

// Hel has no character level in Diablo II, so it is omitted on purpose.
export const RUNE_REQUIRED_LEVEL = {
  el: 11,
  eld: 11,
  tir: 13,
  nef: 13,
  eth: 15,
  ith: 15,
  tal: 17,
  ral: 19,
  ort: 21,
  thul: 23,
  amn: 25,
  sol: 27,
  shael: 29,
  dol: 31,
  io: 35,
  lum: 37,
  ko: 39,
  fal: 41,
  lem: 43,
  pul: 45,
  um: 47,
  mal: 49,
  ist: 51,
  gul: 53,
  vex: 55,
  ohm: 57,
  lo: 59,
  sur: 61,
  ber: 63,
  jah: 65,
  cham: 67,
  zod: 69,
} as const;

const RUNE_FLAVOR = "Can be inserted into socketed items";

export type RuneTooltipSource = {
  name: string;
  slug: string;
  weapon: string | null;
  helmet: string | null;
  armor: string | null;
  shield: string | null;
};

function joinMods(value: string | null) {
  if (!value) return "—";
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines.join(", ") : "—";
}

function requiredLevel(slug: string) {
  if (Object.prototype.hasOwnProperty.call(RUNE_REQUIRED_LEVEL, slug)) {
    return RUNE_REQUIRED_LEVEL[slug as keyof typeof RUNE_REQUIRED_LEVEL];
  }
  return undefined;
}

export function toRuneTooltip(rune: RuneTooltipSource): ItemTooltipItem {
  const level = requiredLevel(rune.slug);
  const lines: ItemTooltipItem["lines"] = [
    { text: RUNE_FLAVOR, gapBefore: true },
    { text: `Weapons: ${joinMods(rune.weapon)}`, gapBefore: true },
    { text: `Armor: ${joinMods(rune.armor)}` },
    { text: `Helms: ${joinMods(rune.helmet)}` },
    { text: `Shields: ${joinMods(rune.shield)}` },
  ];

  if (level != null) {
    lines.push({
      text: `Required Level ${level}`,
      color: ITEM_REQUIREMENT_COLOR,
      gapBefore: true,
    });
  }

  return {
    name: `${rune.name} Rune`,
    quality: "rune",
    lines,
  };
}
