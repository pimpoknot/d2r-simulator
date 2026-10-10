import "server-only";
import { db } from "@/server/db/client";

export async function listSets() {
  return db.setItem.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      baseType: true,
      imageUrl: true,
      pageUrl: true,
    },
  });
}
