import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { loadSetCatalog } from "@/server/scraping/sets-list";

const SETS_PAGE_URL = "https://maxroll.gg/d2/database/set-items";

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

async function main() {
  console.log(`Loading set catalog for ${SETS_PAGE_URL} …`);
  const items = await loadSetCatalog();
  console.log(`Found ${items.length} set items.`);

  const db = createPrismaClient();
  const scrapedAt = new Date();

  try {
    const CHUNK_SIZE = 50;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      await db.$transaction(
        chunk.map((item) =>
          db.setItem.upsert({
            where: { slug: item.slug },
            create: {
              slug: item.slug,
              name: item.name,
              baseType: item.baseType,
              pageUrl: item.pageUrl,
              imageUrl: item.imageUrl,
              sourceUrl: SETS_PAGE_URL,
              scrapedAt,
            },
            update: {
              name: item.name,
              baseType: item.baseType,
              pageUrl: item.pageUrl,
              imageUrl: item.imageUrl,
              sourceUrl: SETS_PAGE_URL,
              scrapedAt,
            },
          }),
        ),
        { timeout: 30000 }
      );
    }

    const stored = await db.setItem.findMany({
      orderBy: { imageUrl: "asc" },
      select: {
        slug: true,
        name: true,
        baseType: true,
        pageUrl: true,
        imageUrl: true,
      },
    });

    console.log(
      JSON.stringify(
        {
          sourceUrl: SETS_PAGE_URL,
          scrapedAt: scrapedAt.toISOString(),
          count: stored.length,
          items: stored,
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
