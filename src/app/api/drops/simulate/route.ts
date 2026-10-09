import { NextResponse } from "next/server";
import { FARM_PRESETS } from "@/constants/farms";
import { resolveTreasureClass } from "@/server/services/tc-engine.service";
import type { GeneratedDrop } from "@/server/services/tc-engine.service";
import type { ApiResponse } from "@/types/index";
import { db } from "@/server/db/client";
import { getUniqueItemByName, getBaseItem, getSetItemByName } from "@/constants/d2-tables/load";
import { translateStats } from "@/constants/d2-tables/stats-translator";

interface SimulateRequest {
  slug: string;
  playersX: number;
  magicFind: number;
}

export interface SimulatedDrop extends GeneratedDrop {
  imageUrl?: string | null;
  tooltipLines?: { text: string; color: string; gapBefore?: boolean }[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SimulateRequest;
    const { slug, playersX, magicFind } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'slug'" } satisfies ApiResponse,
        { status: 400 },
      );
    }

    const pX = Math.min(8, Math.max(1, Math.floor(playersX ?? 1)));
    const mf = Math.max(0, Math.floor(magicFind ?? 0));

    const preset = FARM_PRESETS.find((p) => p.slug === slug);
    if (!preset) {
      return NextResponse.json(
        { success: false, error: `Farm '${slug}' not found` } satisfies ApiResponse,
        { status: 404 },
      );
    }

    // Resolve drops for every kill in the preset
    const drops: SimulatedDrop[] = [];
    for (const kill of preset.kills) {
      for (let i = 0; i < kill.count; i++) {
        const result = resolveTreasureClass(kill.treasureClass, pX, mf);
        drops.push(...result);
      }
    }

    // Collect all UNIQUE names to fetch from DB in a single query
    const uniqueNames = Array.from(
      new Set(drops.filter((d) => d.quality === "UNIQUE").map((d) => d.name))
    );

    const dbUniques = uniqueNames.length > 0 
      ? await db.uniqueItem.findMany({
          where: { name: { in: uniqueNames } },
          select: { name: true, imageUrl: true }
        })
      : [];

    const uniqueImageMap = new Map(dbUniques.map(u => [u.name, u.imageUrl]));

    // Attach imageUrls and tooltips
    const dropsWithImages = drops.map(drop => {
      let imageUrl: string | null = null;
      const tooltipLines: { text: string; color: string; gapBefore?: boolean }[] = [];
      const baseItem = drop.baseCode ? getBaseItem(drop.baseCode) : null;

      if (drop.quality === "UNIQUE") {
        imageUrl = uniqueImageMap.get(drop.name) || null;
        const uItem = getUniqueItemByName(drop.name);
        if (uItem) {
          tooltipLines.push({ text: uItem.baseName || baseItem?.name || "Item", color: "#ffffff" });
          const stats = translateStats(uItem.rawProps);
          if (stats.length > 0) {
            tooltipLines.push(...stats.map((s, i) => ({ text: s.text, color: s.color, gapBefore: i === 0 })));
          }
        }
      } else if (drop.quality === "SET") {
        // We don't have set images scraped yet, so imageUrl is null
        const sItem = getSetItemByName(drop.name);
        if (sItem) {
          tooltipLines.push({ text: sItem.setName || sItem.baseName || baseItem?.name || "Set Item", color: "#00ff00" });
          tooltipLines.push({ text: sItem.name, color: "#00ff00", gapBefore: true });
          const stats = translateStats(sItem.rawProps);
          if (stats.length > 0) {
            tooltipLines.push(...stats.map((s, i) => ({ text: s.text, color: s.color, gapBefore: i === 0 })));
          }
        }
      } else if (drop.quality === "RUNE") {
        const runeSlug = drop.name.toLowerCase().split(" ")[0];
        imageUrl = `/runes/${runeSlug}.webp`;
        tooltipLines.push({ text: "Pode ser inserida em engastes.", color: "#6969ff" });
      } else if (drop.itemType === "gold") {
        imageUrl = "/gold.svg";
        // Gold tooltip is simple, its name contains quantity
      } else {
        // Base items, Magic, Rare, Set
        if (baseItem) {
          tooltipLines.push({ text: `Base: ${baseItem.name}`, color: "#ffffff" });
          
          if (drop.quality === "MAGIC" || drop.quality === "RARE") {
            tooltipLines.push({ text: "Não Identificado", color: "#d22b2b", gapBefore: true });
          } else {
            // White / Gray items show Defense or Damage
            if (baseItem.minac !== undefined) {
              const defStr = baseItem.minac === baseItem.maxac ? `${baseItem.minac}` : `${baseItem.minac}-${baseItem.maxac}`;
              tooltipLines.push({ text: `Defense: ${defStr}`, color: "#ffffff", gapBefore: true });
            }
            if (baseItem.mindam !== undefined) {
              const dmgStr = baseItem.mindam === baseItem.maxdam ? `${baseItem.mindam}` : `${baseItem.mindam}-${baseItem.maxdam}`;
              tooltipLines.push({ text: `One-Hand Damage: ${dmgStr}`, color: "#ffffff", gapBefore: true });
            }
            if (baseItem.twohandmindam !== undefined) {
              const dmgStr = baseItem.twohandmindam === baseItem.twohandmaxdam ? `${baseItem.twohandmindam}` : `${baseItem.twohandmindam}-${baseItem.twohandmaxdam}`;
              tooltipLines.push({ text: `Two-Hand Damage: ${dmgStr}`, color: "#ffffff" });
            }
          }
        }
      }

      return { ...drop, imageUrl, tooltipLines };
    });

    const response: ApiResponse<{ drops: SimulatedDrop[] }> = {
      success: true,
      data: { drops: dropsWithImages },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse,
      { status: 500 },
    );
  }
}
