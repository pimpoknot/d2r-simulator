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
- Strict React 19 / eslint rules: avoid updating refs directly during render; update refs in `useEffect` or callbacks.

## Map (what exists)
- `src/app/page.tsx` — home: `FarmBoard` with `listFarmCards()`. Cards link to `/run/[slug]`.
- `src/app/runes/page.tsx` — rune list (DB) → `RuneTable`.
- `src/app/run/[slug]/page.tsx` — dynamic farm run page rendering `RunInterface`.
- `src/app/api/health/route.ts` — health check API route.
- `src/server/db/client.ts` — Prisma singleton (globalThis cache, `connectionTimeoutMillis: 5000`).
- `src/server/repositories/rune.repo.ts` — `listRunes()`.
- `src/server/services/farm.service.ts` — `listFarmCards()`, `getFarmBySlug()`; builds TC/NoDrop views from `FARM_PRESETS` + d2-tables.
- `src/server/services/tc-engine.service.ts` — core recursive Treasure Class drop resolution engine (`resolveTreasureClass`, calculates NoDrop with Players X scaling, negative picks, basic MF roll).
- `src/server/scraping/*` — Firecrawl parsers used by `scripts/scrape-*.ts`.
- `src/constants/farms.ts` — `FARM_PRESETS` (6 Hell farms: Countess, Andariel, Mephisto, Chaos Sanctuary, Pindle, Baal).
- `src/constants/runes.ts` — `RUNE_REQUIRED_LEVEL`, `toRuneTooltip()`.
- `src/constants/item-tooltip.ts` + `src/components/ui/item-tooltip.tsx` — D2-style tooltip (clones child, portals panel; works on `<tr>`).
- `src/constants/d2-tables/` — static JSON game tables + `load.ts` helpers (`getTreasureClass`, `getBaseItem`, `classifyDropToken`, …). Large JSON: don't read whole files, grep them.
- `src/hooks/use-game-loop.ts` — run countdown timer via `requestAnimationFrame` with smooth progress bar.
- `src/components/modules/farm-board.tsx` — farm cards list linking to run pages.
- `src/components/modules/run-interface.tsx` — client UI for run screen: run time / MF / Players X configuration, interactive start/stop timer, and recent drop feed (currently feeds mock drops on loop).
- `public/runes/*.webp` — rune icons (`imagePath` = `/runes/<slug>.webp`).

## DB (prisma/schema.prisma)
Models: `User`, `Location`, `UserRunConfig`, `StashItem`, `HolyGrail`, `Rune` (`runes`, 33 rows seeded), `UniqueItem` (`unique_items`). Enum `ItemQuality`. Tables use snake_case via `@@map`/`@map`.

## Env / Supabase
- `DATABASE_URL` must use the **Session pooler** (IPv4): `postgresql://postgres.<ref>:<pwd>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`.
- The direct host `db.<ref>.supabase.co` is IPv6-only → hangs → Next error "destination stream closed early". Don't use it.
- After changing `.env`, restart `next dev` (Prisma client cached on `globalThis`).
- `DB_*` vars are unused leftovers from local Docker (`docker-compose.yml`).

## Done
- Farm board with TC/NoDrop breakdown linked to `/run/[slug]`.
- Interactive run screen (`/run/[slug]`) with settings inputs (run time, MF, Players X), RAF game loop timer, and live feed.
- TC drop resolution engine foundation (`src/server/services/tc-engine.service.ts`): recursive TC resolution, Players X NoDrop formula, negative picks handling, rune detection, and MF quality rolls.
- Rune table with tooltips.
- Prisma schema & Supabase connection.
- Firecrawl scrapers for runes and uniques.
- Zero lint/type errors (`npm run lint` passes cleanly).

## What is Missing / Next Tasks

### 1. Drop Simulation API Route (Immediate next step)
- Create `src/app/api/drops/simulate/route.ts` (`POST`):
  - Request body: `{ slug: string, playersX: number, magicFind: number }` (and optional `userId`).
  - Fetches the farm preset by slug, resolves all kills / unique TCs via `resolveTreasureClass` from `tc-engine.service.ts`.
  - Optionally persists dropped items into `StashItem` table.
  - Returns dropped items array with name, quality, itemType.
- Connect `src/components/modules/run-interface.tsx`:
  - Replace the current mock drop generator with a call to `POST /api/drops/simulate` when `onRunComplete` fires.

### 2. TC Engine Refinements
- Integrate official D2 `itemratio.json` lookup in `tc-engine.service.ts` to compute exact chance divisors for Unique, Set, Rare, and Magic based on monster level and base item quality.
- Resolve base items into specific named uniques or sets using `getUniqueItemsForBase(baseCode)` and `getSetItemsForBase(baseCode)` when an item rolls UNIQUE or SET.

### 3. Stash & Inventory Management
- Create `src/server/repositories/stash.repo.ts` (`createStashItems`, `listStashItems`).
- Build Stash UI component (`StashGridFrame`, `use-stash.ts`) to view, filter, and inspect dropped items.
- Attach D2 item tooltip (`ItemTooltip`) to dropped items in the run feed and stash.

### 4. User Run Configuration & Idle Offline Catch-up
- Create `POST /api/runs/config` to persist the user's active farm and average run time in `UserRunConfig`.
- Implement `POST /api/drops/offline-catchup` to calculate missed runs based on elapsed time since `lastRunTimestamp` when returning to the app.

### 5. Holy Grail Tracker & Auth
- Mark discovered unique items in `HolyGrail` table upon drop.
- Build Holy Grail UI showing percentage completed per item type.
- Integrate Supabase Auth for multi-user support (or provide a guest default user ID).
