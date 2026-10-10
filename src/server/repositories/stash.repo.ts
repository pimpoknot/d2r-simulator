import { connection } from "next/server";
import { db } from "@/server/db/client";
import { ItemQuality } from "@/server/db/client";
import "server-only";

export type StashItemCreateInput = {
  itemName: string;
  itemQuality: ItemQuality;
  statsPayload: Record<string, unknown>;
};

export async function createStashItems(userId: string, items: StashItemCreateInput[]) {
  await connection();
  
  if (items.length === 0) return { count: 0 };

  const created = await db.stashItem.createMany({
    data: items.map(item => ({
      userId,
      itemName: item.itemName,
      itemQuality: item.itemQuality,
      statsPayload: item.statsPayload ?? {},
    })),
  });

  return created;
}

export async function listStashItems(userId: string) {
  await connection();
  
  return db.stashItem.findMany({
    where: { userId },
    orderBy: { droppedAt: "desc" },
  });
}
