import { NextResponse } from "next/server";
import { FARM_PRESETS } from "@/constants/farms";
import { resolveTreasureClass } from "@/server/services/tc-engine.service";
import type { GeneratedDrop } from "@/server/services/tc-engine.service";
import type { ApiResponse } from "@/types/index";
import { db } from "@/server/db/client";

interface SimulateRequest {
  slug: string;
  playersX: number;
  magicFind: number;
}

export interface SimulatedDrop extends GeneratedDrop {
  imageUrl?: string | null;
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

    // Attach imageUrls
    const dropsWithImages = drops.map(drop => {
      let imageUrl: string | null = null;
      
      if (drop.quality === "UNIQUE") {
        imageUrl = uniqueImageMap.get(drop.name) || null;
      } else if (drop.quality === "RUNE") {
        const runeSlug = drop.name.toLowerCase().split(" ")[0];
        imageUrl = `/runes/${runeSlug}.webp`;
      }

      return { ...drop, imageUrl };
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
