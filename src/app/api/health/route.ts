import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/constants/index";
import type { ApiResponse } from "@/types/index";

export async function GET() {
  const responseData: ApiResponse<{
    status: string;
    app: string;
    timestamp: string;
  }> = {
    success: true,
    data: {
      status: "healthy",
      app: APP_CONFIG.NAME,
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(responseData, { status: 200 });
}
