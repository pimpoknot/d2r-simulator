import { NextResponse } from "next/server";
import { listStashItems, createStashItems } from "@/server/repositories/stash.repo";
import { ItemQuality } from "@/server/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");
    
    if (!userId) {
      const { getDefaultUserId } = await import("@/server/repositories/user.repo");
      userId = await getDefaultUserId();
    }

    const items = await listStashItems(userId);
    return NextResponse.json({ success: true, data: { items } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let userId = body.userId;
    
    if (!userId) {
      const { getDefaultUserId } = await import("@/server/repositories/user.repo");
      userId = await getDefaultUserId();
    }
    
    const items = body.items as { itemName: string; itemQuality: ItemQuality; statsPayload: Record<string, unknown> }[];

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Invalid items payload" }, { status: 400 });
    }

    const created = await createStashItems(userId, items);
    return NextResponse.json({ success: true, data: { count: created.count } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
