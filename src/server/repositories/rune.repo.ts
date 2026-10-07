import "server-only";

import { connection } from "next/server";

import { db } from "@/server/db/client";

export async function listRunes() {
  await connection();

  return db.rune.findMany({
    orderBy: { tier: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      tier: true,
      imagePath: true,
      weapon: true,
      helmet: true,
      armor: true,
      shield: true,
    },
  });
}
