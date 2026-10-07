import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { RUNES_PAGE_URL, scrapeRunesPageHtml } from "@/server/scraping/firecrawl";
import {
  parseRuneTable,
  type ScrapedRune,
} from "@/server/scraping/rune-table";

const IMAGE_ROOT = path.join(process.cwd(), "public", "runes");
const ALLOWED_EXTENSIONS = new Set(["webp", "png", "gif", "jpg", "jpeg"]);

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }, { schema: "public" }),
    log: ["error"],
  });
}

function imageExtension(imageUrl: string) {
  const extension = new URL(imageUrl).pathname.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(`Unexpected rune image type: ${imageUrl}`);
  }
  return extension === "jpeg" ? "jpg" : extension;
}

async function downloadRuneImage(rune: ScrapedRune) {
  const extension = imageExtension(rune.imageUrl);
  const filename = `${rune.slug}.${extension}`;
  const response = await fetch(rune.imageUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${rune.name} icon (${response.status}) from ${rune.imageUrl}`,
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) {
    throw new Error(`Downloaded an empty icon for ${rune.name}`);
  }

  await writeFile(path.join(IMAGE_ROOT, filename), bytes);

  return {
    imagePath: `/runes/${filename}`,
    bytes: bytes.length,
  };
}

async function main() {
  const html = await scrapeRunesPageHtml();
  const runes = parseRuneTable(html);
  await mkdir(IMAGE_ROOT, { recursive: true });

  const saved = await Promise.all(
    runes.map(async (rune) => ({
      rune,
      image: await downloadRuneImage(rune),
    })),
  );

  const db = createPrismaClient();
  const scrapedAt = new Date();

  try {
    await db.$transaction(
      saved.map(({ rune, image }) =>
        db.rune.upsert({
          where: { slug: rune.slug },
          create: {
            name: rune.name,
            slug: rune.slug,
            tier: rune.tier,
            imageUrl: rune.imageUrl,
            imagePath: image.imagePath,
            weapon: rune.bonuses.weapon,
            helmet: rune.bonuses.helmet,
            armor: rune.bonuses.armor,
            shield: rune.bonuses.shield,
            sourceUrl: RUNES_PAGE_URL,
            scrapedAt,
          },
          update: {
            name: rune.name,
            tier: rune.tier,
            imageUrl: rune.imageUrl,
            imagePath: image.imagePath,
            weapon: rune.bonuses.weapon,
            helmet: rune.bonuses.helmet,
            armor: rune.bonuses.armor,
            shield: rune.bonuses.shield,
            sourceUrl: RUNES_PAGE_URL,
            scrapedAt,
          },
        }),
      ),
    );

    const stored = await db.rune.findMany({
      orderBy: { tier: "asc" },
      select: {
        tier: true,
        name: true,
        weapon: true,
        helmet: true,
        armor: true,
        shield: true,
        imagePath: true,
      },
    });

    console.log(
      JSON.stringify(
        {
          sourceUrl: RUNES_PAGE_URL,
          count: stored.length,
          images: saved.map(({ rune, image }) => ({
            name: rune.name,
            path: image.imagePath,
            bytes: image.bytes,
          })),
          runes: stored,
        },
        null,
        2,
      ),
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
