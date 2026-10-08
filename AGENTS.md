<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.


<!-- END:nextjs-agent-rules -->

# D2R Simulator — agent brief

Idle/farming loot simulator for Diablo II: Resurrected. UI text in **pt-BR**, code/comments in English.
Read this first; only open `README.md` / `src/docs/project-architecture.md` if you need roadmap/long-term design (they describe planned folders that do NOT exist yet).

## Stack
Next.js 16.3 App Router (Turbopack) · React 19.2 · TS strict · Tailwind v4 (`@tailwindcss/postcss`, no config file) · Prisma 7 + `@prisma/adapter-pg` · Postgres on **Supabase** · Firecrawl (scraping scripts only) · `tsx` for scripts.

## Commands
`npm run dev` · `npm run lint` · `npm run db:push` (push schema + generate) · `npm run db:generate` · `npm run db:scrape:runes` · `npm run db:scrape:uniques`

## Conventions
- Alias `@/*` → `src/*`.
- Server-only code in `src/server/**` with `import "server-only"`. DB access only via repositories (`src/server/repositories/*.repo.ts`).
- Repos that hit DB call `await connection()` (from `next/server`) to opt out of prerender.
- Client components: `"use client"` in `src/components/modules|ui`. Class merging: `cn()` from `@/lib/utils` (no clsx/tw-merge).
- Dark D2 palette: bg `#0c0c0e`, panels `#141416`, accent `sky-400`, item names `amber-400`. Geist fonts; `public/diablo.ttf` available but unused.
- Page `params` is a **Promise** in this Next version — type as `Promise<{ slug: string }>` and `await` it.
- Prisma client is generated to `src/generated/prisma` (import from `@/server/db/client`, never `@prisma/client`).

## Map (what exists)
- `src/app/page.tsx` — home: `FarmBoard` with `listFarmCards()`.
- `src/app/runes/page.tsx` — rune list (DB) → `RuneTable`.
- `src/app/run/[slug]/page.tsx` — farm run screen → `RunInterface` (uses `useGameLoop`).
- `src/app/api/health/route.ts` — only API route.
- `src/server/db/client.ts` — Prisma singleton (globalThis cache, `connectionTimeoutMillis: 5000`).
- `src/server/repositories/rune.repo.ts` — `listRunes()`.
- `src/server/services/farm.service.ts` — `listFarmCards()`, `getFarmBySlug()`; builds TC/NoDrop views from `FARM_PRESETS` + d2-tables.
- `src/server/scraping/*` — Firecrawl parsers used by `scripts/scrape-*.ts`.
- `src/constants/farms.ts` — `FARM_PRESETS` (6 Hell farms).
- `src/constants/runes.ts` — `RUNE_REQUIRED_LEVEL`, `toRuneTooltip()`.
- `src/constants/item-tooltip.ts` + `src/components/ui/item-tooltip.tsx` — D2-style tooltip (clones child, portals panel; works on `<tr>`).
- `src/constants/d2-tables/` — static JSON game tables + `load.ts` helpers (`getTreasureClass`, `getBaseItem`, `classifyDropToken`, …). Large JSON: don't read whole files, grep them.
- `src/hooks/use-game-loop.ts` — run countdown timer.
- `public/runes/*.webp` — rune icons (`imagePath` = `/runes/<slug>.webp`).

## DB (prisma/schema.prisma)
Models: `User`, `Location`, `UserRunConfig`, `StashItem`, `HolyGrail`, `Rune` (`runes`, 33 rows seeded), `UniqueItem` (`unique_items`). Enum `ItemQuality`. Tables use snake_case via `@@map`/`@map`.

## Env / Supabase
- `DATABASE_URL` must use the **Session pooler** (IPv4): `postgresql://postgres.<ref>:<pwd>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`.
- The direct host `db.<ref>.supabase.co` is IPv6-only → hangs → Next error "destination stream closed early". Don't use it.
- After changing `.env`, restart `next dev` (Prisma client cached on `globalThis`).
- `DB_*` vars are unused leftovers from local Docker (`docker-compose.yml`).

## Done
Farm board with TC/NoDrop breakdown · run screen + game loop timer · rune table with tooltips · Prisma schema · Firecrawl scrapers (runes, uniques) · Supabase connection.

## Next (roadmap)
TC engine recursive resolver (NoDrop, MF diminishing returns, Players X) · drop simulation API · offline catch-up · stash (drag & drop) · Holy Grail UI · Supabase Auth · Vercel deploy.
