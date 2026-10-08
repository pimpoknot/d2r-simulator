import "server-only";

import { FARM_PRESETS, type FarmPreset } from "@/constants/farms";
import {
  getBaseItem,
  getItemType,
  getTreasureClass,
  type TreasureClassEntry,
  type TreasureClassView,
} from "@/constants/d2-tables";

export interface FarmEntryView {
  label: string;
  probability: number;
}

export interface FarmTreasureClassView {
  name: string;
  picks: number;
  noDrop: number;
  entries: FarmEntryView[];
  missing: boolean;
}

export interface FarmCard {
  slug: string;
  name: string;
  area: string;
  difficulty: string;
  note: string;
  killCount: number;
  monsters: string[];
  treasureClasses: FarmTreasureClassView[];
}

function entryLabel(entry: TreasureClassEntry): string {
  const target = entry.target;

  switch (target.kind) {
    case "treasureClass":
      return target.name;
    case "baseItem":
      return getBaseItem(target.code)?.name ?? target.code;
    case "itemType":
      return `${getItemType(target.code)?.name ?? target.code} ${target.level}`;
    case "uniqueItem":
      return target.name;
    case "gold":
      return target.multiplier === null ? "Ouro" : `Ouro ×${target.multiplier}`;
    case "unresolved":
      return target.token;
  }
}

function toTreasureClassView(name: string, row: TreasureClassView | null): FarmTreasureClassView {
  if (!row) {
    return { name, picks: 0, noDrop: 0, entries: [], missing: true };
  }

  return {
    name: row.name,
    picks: row.picks,
    noDrop: row.noDrop,
    entries: row.entries.map((entry) => ({
      label: entryLabel(entry),
      probability: entry.probability,
    })),
    missing: false,
  };
}

function uniqueTreasureClasses(preset: FarmPreset): FarmTreasureClassView[] {
  const names = [...new Set(preset.kills.map((kill) => kill.treasureClass))];
  return names.map((name) => toTreasureClassView(name, getTreasureClass(name)));
}

export function listFarmCards(): FarmCard[] {
  return FARM_PRESETS.map((preset) => ({
    slug: preset.slug,
    name: preset.name,
    area: preset.area,
    difficulty: preset.difficulty,
    note: preset.note,
    killCount: preset.kills.reduce((sum, kill) => sum + kill.count, 0),
    monsters: preset.kills.map((kill) => kill.monster),
    treasureClasses: uniqueTreasureClasses(preset),
  }));
}

export function getFarmBySlug(slug: string): FarmCard | undefined {
  const preset = FARM_PRESETS.find((p) => p.slug === slug);
  if (!preset) return undefined;

  return {
    slug: preset.slug,
    name: preset.name,
    area: preset.area,
    difficulty: preset.difficulty,
    note: preset.note,
    killCount: preset.kills.reduce((sum, kill) => sum + kill.count, 0),
    monsters: preset.kills.map((kill) => kill.monster),
    treasureClasses: uniqueTreasureClasses(preset),
  };
}
