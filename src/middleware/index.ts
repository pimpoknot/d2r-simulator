import type { NextRequest } from "next/server";

/**
 * Reusable middleware helper functions (auth checks, rate-limit headers, etc.).
 */
export function validateAuthHeader(request: NextRequest): boolean {
  const token = request.headers.get("authorization");
  return Boolean(token);
}
