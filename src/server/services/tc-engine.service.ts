import "server-only";
import { getTreasureClass, getBaseItem } from "@/constants/d2-tables";
import type { DropToken } from "@/constants/d2-tables/types";

export interface GeneratedDrop {
  itemType: string;
  name: string;
  quality: string;
}

// Applies Players X to base NoDrop
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

// Rolls a quality based on Magic Find (simplified for now)
function rollQuality(baseName: string, magicFind: number): string {
  // We'll expand this with ItemRatio later. 
  // For now, a simple probability bump based on MF.
  const mfFactor = magicFind / 100;
  
  const rand = Math.random();
  if (rand < 0.01 + (0.01 * mfFactor)) return "UNIQUE";
  if (rand < 0.05 + (0.02 * mfFactor)) return "SET";
  if (rand < 0.15 + (0.05 * mfFactor)) return "RARE";
  if (rand < 0.30 + (0.10 * mfFactor)) return "MAGIC";
  return "NORMAL";
}

// Resolves a single token drop
function resolveToken(token: DropToken, playersX: number, magicFind: number, depth = 0): GeneratedDrop[] {
  if (depth > 20) return []; // Prevent infinite recursion

  switch (token.kind) {
    case "treasureClass":
      return resolveTreasureClass(token.name, playersX, magicFind, depth + 1);
    
    case "baseItem":
      const base = getBaseItem(token.code);
      if (!base) return [];
      
      // If it's a rune, just return it as a RUNE
      if (base.type === "rune" || token.code.startsWith("r") && !isNaN(Number(token.code.slice(1)))) {
        return [{ itemType: "rune", name: base.name, quality: "RUNE" }];
      }

      return [{
        itemType: base.type || "unknown",
        name: base.name,
        quality: rollQuality(base.name, magicFind)
      }];

    case "uniqueItem":
      return [{
        itemType: "unique",
        name: token.name,
        quality: "UNIQUE"
      }];

    case "gold":
      return [{
        itemType: "gold",
        name: "Gold",
        quality: "NORMAL"
      }];

    case "itemType":
      // Generates a base item from a specific type (e.g. armo87)
      // Usually requires rolling over items of that type & level.
      // We return a generic fallback for now.
      return [{
        itemType: token.code,
        name: `Base ${token.code} (lvl ${token.level})`,
        quality: rollQuality(token.code, magicFind)
      }];

    case "unresolved":
      return [];
      
    default:
      return [];
  }
}

export function resolveTreasureClass(
  tcName: string, 
  playersX: number, 
  magicFind: number,
  depth = 0
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

  for (let i = 0; i < picks; i++) {
    if (isNegativePicks) {
      // In negative picks, evaluate entries sequentially instead of total random
      // (D2 handles this by dropping up to 1 of each until picks runs out, but we simplify to regular sequential roll)
      const entry = tc.entries[i];
      if (entry) {
        // Simplify: drop resolved token directly for the simulation
        const resolved = resolveToken(entry.target, playersX, magicFind, depth + 1);
        drops.push(...resolved);
      }
    } else {
      // Random weighted roll
      let roll = Math.random() * totalWeight;
      
      // Check NoDrop first
      if (roll < actualNoDrop) {
        continue; // Nothing dropped this pick
      }
      roll -= actualNoDrop;

      // Find which entry won
      for (const entry of tc.entries) {
        if (roll < entry.probability) {
          const resolved = resolveToken(entry.target, playersX, magicFind, depth + 1);
          drops.push(...resolved);
          break;
        }
        roll -= entry.probability;
      }
    }
  }

  return drops;
}
