# 🔥 D2R Loot Simulator

A **web-based Diablo II Resurrected loot reference and idle simulator** built with Next.js 16 (App Router). It exposes accurate, server-side Treasure Class (TC) drop tables for the six most popular Hell farming spots, a full rune reference viewer with authentic in-game tooltips, and the foundation for an offline-progress idle game loop — all wrapped in a Diablo-themed dark UI.

---

## ✨ Features

### 🗺️ Farm Board (Home Page)
- Six pre-configured **Hell farming locations**: Andariel, Mephisto, Travincal, Chaos Sanctuary, Pindleskin, and Baal.
- Each farm card displays the boss's **Treasure Class**, the number of "picks" (item rolls), the **NoDrop** weight, and the weighted probability of every TC entry.
- Drop calculations run **server-side only** — no client-side cheating possible.

### 💎 Rune Reference (`/runes`)
- Full list of all **33 runes** (El → Zod) with rune images sourced via Firecrawl.
- Interactive **in-game-style tooltip** for every rune showing:
  - Weapon, Armor, Helm, and Shield socket modifiers.
  - Required character level (Hel is intentionally omitted — it has none).
  - Color-coded stat lines matching the original game UI.

### 🧮 TC Engine (Server Layer)
- Recursive **Treasure Class resolver** that handles NoDrop adjustments, Players X modifiers, and TC cascades exactly as the original game does.
- Modular service layer (`src/server/services/`) protected with `server-only` to prevent any logic leaking to the browser bundle.

### 🏆 Holy Grail Tracker *(schema ready)*
- Database schema for tracking discovered Unique/Set items against the complete game roster.

### ⏱️ Idle / Offline Progress Loop *(planned)*
- Users set their average clear time per location.
- Time-elapsed on re-open drives bulk drop calculations, capped to prevent abuse.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, Tailwind CSS v4 |
| Backend | Next.js Server Actions & Route Handlers |
| ORM | Prisma 7 (`prisma-client`) |
| Database | PostgreSQL 16 |
| DB Hosting | Supabase / Neon (serverless Postgres) |
| Scraping | Firecrawl (rune & unique item images/stats) |
| Auth (planned) | Supabase Auth |
| Animation (planned) | Framer Motion |
| Drag & Drop (planned) | `@dnd-kit/core` |
| Deployment | Vercel |

---

## 📁 Project Structure

```text
d2r-simulator/
├── public/
│   ├── runes/          # Rune .webp images (el.webp … zod.webp)
│   └── diablo.ttf      # Authentic Diablo font
│
├── prisma/
│   └── schema.prisma   # DB models: User, Location, UserRunConfig, StashItem, HolyGrail, Rune, UniqueItem
│
├── scripts/
│   ├── scrape-runes.ts     # Populates the `runes` table via Firecrawl
│   └── scrape-uniques.ts   # Populates the `unique_items` table via Firecrawl
│
└── src/
    ├── app/
    │   ├── page.tsx            # Farm Board — list of Hell farming locations
    │   ├── runes/page.tsx      # Rune reference viewer
    │   └── api/health/         # GET /api/health — infrastructure health check
    │
    ├── components/
    │   ├── ui/                 # Atomic primitives (Button, Badge, Modal, Input…)
    │   ├── layout/             # Shell components (Header, Footer, Nav)
    │   └── modules/
    │       ├── farm-board.tsx  # Farm location card grid
    │       └── rune-table.tsx  # Rune list with tooltip
    │
    ├── server/
    │   ├── db/                 # Prisma client singleton
    │   ├── repositories/       # Data access layer (user, run, stash)
    │   ├── services/           # Business logic & TC math engine
    │   └── actions/            # Server Actions (mutations)
    │
    ├── constants/
    │   ├── runes.ts            # Required levels & tooltip builder
    │   ├── farms.ts            # FARM_PRESETS — 6 Hell farm configurations
    │   ├── d2-tables/          # Pre-parsed TC, base item, unique/set JSON tables
    │   └── item-tooltip.ts     # Tooltip color & line type system
    │
    ├── types/                  # TypeScript interfaces & DTOs
    ├── hooks/                  # Custom React hooks (game loop, stash)
    ├── contexts/               # React Context providers
    ├── lib/utils.ts            # Shared helpers (cn, formatters)
    └── middleware/             # Route protection & rate limiting
```

### Path Aliases

All source imports use the `@/*` alias (resolves to `src/*`). Additional short-cuts:

```
@/components/*  →  src/components/*
@/server/*      →  src/server/*
@/services/*    →  src/server/services/*
@/repositories/* → src/server/repositories/*
@/actions/*     →  src/server/actions/*
@/constants/*   →  src/constants/*
@/hooks/*       →  src/hooks/*
@/lib/*         →  src/lib/*
@/types/*       →  src/types/*
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USER ||--o{ USER_RUN_CONFIG : configures
    USER ||--o{ STASH_ITEM : owns
    USER ||--o{ HOLY_GRAIL : tracks
    LOCATION ||--o{ USER_RUN_CONFIG : has

    USER {
        string id PK
        string username
        string email
        int magic_find
        int players_x
        datetime last_login
    }

    LOCATION {
        string id PK
        string name
        string target_monster
        string treasure_class_id
    }

    USER_RUN_CONFIG {
        string id PK
        string user_id FK
        string location_id FK
        int avg_run_time_ms
        datetime last_run_timestamp
        boolean is_active
    }

    STASH_ITEM {
        string id PK
        string user_id FK
        string item_name
        string item_quality
        json stats_payload
        datetime dropped_at
    }

    HOLY_GRAIL {
        string id PK
        string user_id FK
        string unique_item_id
        datetime discovered_at
    }
```

**Item quality enum:** `NORMAL | MAGIC | RARE | SET | UNIQUE | RUNE | CRAFTED`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **Docker** (for the local Postgres container) — or a Supabase / Neon project URL.
- A [Firecrawl](https://www.firecrawl.dev) API key if you want to run the data-scraping scripts.

### 1. Clone & install

```bash
git clone https://github.com/your-username/d2r-simulator.git
cd d2r-simulator
npm install          # also runs `prisma generate` via postinstall
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Prisma / PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/d2r_simulator?schema=public"

# Docker overrides (optional)
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="d2r_simulator"
DB_PORT="5432"

# Firecrawl (only needed for scraping scripts)
FIRECRAWL_API_KEY="fc-your-key"
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Apply migrations & generate the Prisma client

```bash
npm run db:push
```

### 5. (Optional) Seed the database with scraped data

```bash
npm run db:scrape:runes     # populates the `runes` table
npm run db:scrape:uniques   # populates the `unique_items` table
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with HMR |
| `npm run build` | Generate Prisma client then build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client from schema |
| `npm run db:push` | Push schema to DB + regenerate client |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:scrape:runes` | Scrape rune data via Firecrawl |
| `npm run db:scrape:uniques` | Scrape unique item data via Firecrawl |

---

## 🔌 API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Infrastructure health check |
| `GET` | `/api/locations` | Available farming zones & Treasure Classes *(planned)* |
| `POST` | `/api/drops/simulate` | Core drop engine — rolls against D2 loot tables *(planned)* |
| `POST` | `/api/drops/offline-catchup` | Calculates offline time & processes bulk drops *(planned)* |
| `POST` | `/api/runs/config` | Saves user run config for a location *(planned)* |
| `GET` | `/api/inventory/grail` | Fetches Holy Grail progress *(planned)* |

---

## 🗺️ Roadmap

- [x] Farm Board with TC/NoDrop breakdown
- [x] Rune reference viewer with authentic tooltips
- [x] Prisma schema & Docker Compose setup
- [x] Firecrawl scraping scripts for runes & uniques
- [ ] TC Engine recursive resolver (NoDrop, MF diminishing returns, Players X)
- [ ] Active farming game loop with visual countdown timer
- [ ] Offline / idle progress catch-up mechanic
- [ ] Stash inventory with drag-and-drop (`@dnd-kit`)
- [ ] Loot drop animations (Framer Motion)
- [ ] Holy Grail tracker UI
- [ ] User authentication (Supabase Auth)
- [ ] Vercel deployment with serverless Postgres

---

## 📄 License

Private project — all rights reserved.
