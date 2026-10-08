import "server-only";
import {
  getTreasureClass,
  getBaseItem,
  getItemRatio,
  getUniqueItemsForBase,
  getSetItemsForBase,
} from "@/constants/d2-tables";
import type { DropToken, TreasureClassView } from "@/constants/d2-tables/types";

export interface GeneratedDrop {
  itemType: string;
  name: string;
  quality: string;
  /** Base item code (e.g. "uap" for Shako). Useful for tooltips / icons. */
  baseCode?: string;
}

// ---------------------------------------------------------------------------
// NoDrop – Players X adjustment
// ---------------------------------------------------------------------------

function calculateNoDrop(baseNoDrop: number, probSum: number, playersX: number): number {
  if (baseNoDrop <= 0 || playersX <= 1) return baseNoDrop;

  // D2 NoDrop formula:
  // Prob = 1 - (NoDrop / (NoDrop + ProbSum))^N
  // NewNoDrop = int( ProbSum / ((1/Prob) - 1) )
  const prob = 1 - Math.pow(baseNoDrop / (baseNoDrop + probSum), playersX);
  if (prob >= 1) return 0;

  const newNoDrop = Math.floor(probSum / ((1 / prob) - 1));
  return newNoDrop;
}

// ---------------------------------------------------------------------------
// Quality roll – real D2 ItemRatio formula
// ---------------------------------------------------------------------------

/** Effective MF caps per quality tier (D2 diminishing returns). */
function effectiveMF(rawMF: number, tier: "unique" | "set" | "rare" | "magic"): number {
  // D2 formula: EffMF = rawMF * factor / (rawMF + factor)
  const factors: Record<typeof tier, number> = {
    unique: 250,
    set: 500,
    rare: 600,
    magic: 600, // magic has no real cap in D2 but we cap at 600
  };
  const f = factors[tier];
  return Math.floor((rawMF * f) / (rawMF + f));
}

/**
 * Roll item quality using the real D2 itemratio.json formula.
 *
 * @param itemLevel  - qlvl of the base item
 * @param monsterLevel - mlvl (we derive from TC level when available)
 * @param magicFind - raw MF from player
 * @param baseCode  - code of the base item for unique/set resolution
 * @param tcOverrides - per-TC quality overrides (Unique/Set/Rare/Magic columns)
 */
function rollQuality(
  itemLevel: number,
  monsterLevel: number,
  magicFind: number,
  baseCode: string,
  tcOverrides?: Pick<TreasureClassView, "unique" | "set" | "rare" | "magic">,
): { quality: string; resolvedName: string | null } {
  // Determine which itemratio row to use (version 0, non-uber, non-class-specific for now)
  const ratio = getItemRatio({ version: 0, uber: false, classSpecific: false });

  if (ratio) {
    // --- UNIQUE ---
    const uBase = tcOverrides?.unique ?? ratio.unique;
    const uDiv = ratio.uniqueDivisor;
    const uMin = ratio.uniqueMin;
    const uChance = Math.max(uMin, uBase - Math.floor((monsterLevel - itemLevel) / uDiv));
    const uEffMF = effectiveMF(magicFind, "unique");
    const uFinal = Math.max(uMin, uChance - Math.floor((uChance * uEffMF) / (uEffMF + uChance)));
    if (uFinal > 0 && Math.random() * uFinal < 1) {
      const resolved = resolveUniqueOrSetName(baseCode, "UNIQUE");
      if (resolved) return resolved;
      // No unique exists for this base → fall through to SET
    }

    // --- SET ---
    const sBase = tcOverrides?.set ?? ratio.set;
    const sDiv = ratio.setDivisor;
    const sMin = ratio.setMin;
    const sChance = Math.max(sMin, sBase - Math.floor((monsterLevel - itemLevel) / sDiv));
    const sEffMF = effectiveMF(magicFind, "set");
    const sFinal = Math.max(sMin, sChance - Math.floor((sChance * sEffMF) / (sEffMF + sChance)));
    if (sFinal > 0 && Math.random() * sFinal < 1) {
      const resolved = resolveUniqueOrSetName(baseCode, "SET");
      if (resolved) return resolved;
      // No set item for this base → fall through to RARE
    }

    // --- RARE ---
    const rBase = tcOverrides?.rare ?? ratio.rare;
    const rDiv = ratio.rareDivisor;
    const rMin = ratio.rareMin;
    const rChance = Math.max(rMin, rBase - Math.floor((monsterLevel - itemLevel) / rDiv));
    const rEffMF = effectiveMF(magicFind, "rare");
    const rFinal = Math.max(rMin, rChance - Math.floor((rChance * rEffMF) / (rEffMF + rChance)));
    if (rFinal > 0 && Math.random() * rFinal < 1) {
      return { quality: "RARE", resolvedName: null };
    }

    // --- MAGIC ---
    const mBase = tcOverrides?.magic ?? ratio.magic;
    const mDiv = ratio.magicDivisor;
    const mMin = ratio.magicMin;
    const mChance = Math.max(mMin, mBase - Math.floor((monsterLevel - itemLevel) / mDiv));
    const mEffMF = effectiveMF(magicFind, "magic");
    const mFinal = Math.max(mMin, mChance - Math.floor((mChance * mEffMF) / (mEffMF + mChance)));
    if (mFinal > 0 && Math.random() * mFinal < 1) {
      return { quality: "MAGIC", resolvedName: null };
    }
  }

  return { quality: "NORMAL", resolvedName: null };
}

// ---------------------------------------------------------------------------
// Unique / Set name resolution
// ---------------------------------------------------------------------------

function resolveUniqueOrSetName(
  baseCode: string,
  quality: "UNIQUE" | "SET",
): { quality: string; resolvedName: string } | null {
  if (quality === "UNIQUE") {
    const uniques = getUniqueItemsForBase(baseCode).filter((u) => u.spawnable);
    if (uniques.length === 0) return null;
    // Weighted by rarity (higher rarity = more likely in D2)
    const totalRarity = uniques.reduce((s, u) => s + Math.max(1, u.rarity), 0);
    let roll = Math.random() * totalRarity;
    for (const u of uniques) {
      roll -= Math.max(1, u.rarity);
      if (roll <= 0) return { quality: "UNIQUE", resolvedName: u.name };
    }
    return { quality: "UNIQUE", resolvedName: uniques[0].name };
  }

  const sets = getSetItemsForBase(baseCode).filter((s) => s.spawnable);
  if (sets.length === 0) return null;
  const totalRarity = sets.reduce((s, item) => s + Math.max(1, item.rarity), 0);
  let roll = Math.random() * totalRarity;
  for (const item of sets) {
    roll -= Math.max(1, item.rarity);
    if (roll <= 0) return { quality: "SET", resolvedName: item.name };
  }
  return { quality: "SET", resolvedName: sets[0].name };
}

// ---------------------------------------------------------------------------
// Token resolution
// ---------------------------------------------------------------------------

function resolveToken(
  token: DropToken,
  playersX: number,
  magicFind: number,
  monsterLevel: number,
  tcOverrides: Pick<TreasureClassView, "unique" | "set" | "rare" | "magic"> | undefined,
  depth: number,
): GeneratedDrop[] {
  if (depth > 20) return [];

  switch (token.kind) {
    case "treasureClass":
      return resolveTreasureClass(token.name, playersX, magicFind, depth + 1);

    case "baseItem": {
      const base = getBaseItem(token.code);
      if (!base) return [];

      // Runes are always RUNE quality — no MF roll
      if (base.type === "rune" || (token.code.startsWith("r") && !isNaN(Number(token.code.slice(1))))) {
        return [{ itemType: "rune", name: base.name, quality: "RUNE", baseCode: base.code }];
      }

      const { quality, resolvedName } = rollQuality(
        base.level,
        monsterLevel,
        magicFind,
        base.code,
        tcOverrides,
      );

      return [{
        itemType: base.type || "unknown",
        name: resolvedName ?? base.name,
        quality,
        baseCode: base.code,
      }];
    }

    case "uniqueItem":
      return [{
        itemType: "unique",
        name: token.name,
        quality: "UNIQUE",
        baseCode: token.baseCode,
      }];

    case "gold":
      return [{
        itemType: "gold",
        name: "Ouro",
        quality: "NORMAL",
      }];

    case "itemType":
      // Generates a base from an item-type bucket (e.g. armo87).
      // Full resolution would enumerate all bases of that type ≤ level.
      // For now, return with a quality roll using the level from the token.
      return [{
        itemType: token.code,
        name: `${token.code} (ilvl ${token.level})`,
        quality: rollQuality(token.level, monsterLevel, magicFind, token.code, tcOverrides).quality,
      }];

    case "unresolved":
      return [];

    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function resolveTreasureClass(
  tcName: string,
  playersX: number,
  magicFind: number,
  depth = 0,
): GeneratedDrop[] {
  if (depth > 20) return [];

  const tc = getTreasureClass(tcName);
  if (!tc) return [];

  let picks = tc.picks;
  const isNegativePicks = picks < 0;
  picks = Math.abs(picks);

  const drops: GeneratedDrop[] = [];

  const probSum = tc.entries.reduce((sum, entry) => sum + entry.probability, 0);
  const actualNoDrop = isNegativePicks ? 0 : calculateNoDrop(tc.noDrop, probSum, playersX);
  const totalWeight = probSum + actualNoDrop;

  // Monster level derived from TC level (fallback to 85 for Hell)
  const monsterLevel = tc.level ?? 85;

  // TC-level quality overrides (some TCs force certain quality ratios)
  const tcOverrides = (tc.unique !== null || tc.set !== null || tc.rare !== null || tc.magic !== null)
    ? { unique: tc.unique, set: tc.set, rare: tc.rare, magic: tc.magic }
    : undefined;

  for (let i = 0; i < picks; i++) {
    if (isNegativePicks) {
      // Negative picks: each entry is evaluated independently (drop up to 1 of each)
      const entry = tc.entries[i];
      if (entry) {
        const resolved = resolveToken(entry.target, playersX, magicFind, monsterLevel, tcOverrides, depth + 1);
        drops.push(...resolved);
      }
    } else {
      // Random weighted roll
      let roll = Math.random() * totalWeight;

      // Check NoDrop first
      if (roll < actualNoDrop) {
        continue;
      }
      roll -= actualNoDrop;

      // Find which entry won
      for (const entry of tc.entries) {
        if (roll < entry.probability) {
          const resolved = resolveToken(entry.target, playersX, magicFind, monsterLevel, tcOverrides, depth + 1);
          drops.push(...resolved);
          break;
        }
        roll -= entry.probability;
      }
    }
  }

  return drops;
}
