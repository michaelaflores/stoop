# Stoop

Neighborhood Memory & Connection Platform for Philadelphia.

Named after the iconic front stoops where neighbors gather to talk, share news, and look out for each other. Stoop brings that experience online — with real-time feeds, community events, safety alerts, and AI-powered neighborhood memory.

Built for the [Good Neighbors Hackathon](https://indyhall.org/goodneighbors/) at Indy Hall.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, MapLibre GL
- **Backend**: Supabase (Auth, Database, RLS, Realtime, Edge Functions, Storage, Webhooks)
- **AI**: Supabase Edge Functions with built-in `gte-small` model for zero-dependency semantic embeddings + pgvector for similarity search
- **Geo**: PostGIS for neighborhood boundaries and location-based features
- **Deploy**: Vercel (frontend) + Supabase (backend)

## Supabase Features Used

| Feature | Usage |
|---|---|
| Auth | Email + OAuth sign-in |
| Database (Postgres) | All app data with relational schema |
| Row-Level Security | Posts/comments scoped to user's neighborhood |
| Realtime — Postgres Changes | Live feed and comment updates |
| Realtime — Broadcast | Urgent safety alert push |
| Realtime — Presence | "Who's on the stoop" active users |
| Edge Functions | `generate-embedding` — auto-generates 384-dim vectors on content INSERT/UPDATE using built-in gte-small model (zero external API deps). `search` — semantic similarity search via pgvector RPC. |
| Database Webhooks | Trigger Edge Functions on INSERT/UPDATE, profile auto-creation on signup |
| Storage | Photo attachments with RLS |
| pgvector | HNSW-indexed semantic search over neighborhood posts, listings, and requests |
| PostGIS | Neighborhood boundary assignment via ST_Contains |
| pg_cron | Alert archival, reputation decay, overdue borrow checks |
| RPC Functions | semantic_search, search_neighborhood, complete_borrow, get_leaderboard, assign_neighborhood |

## Edge Functions

Stoop uses two Edge Functions, both leveraging Supabase's built-in `gte-small` embedding model — no OpenAI key or external API required:

### `generate-embedding`
- **Trigger**: Database webhook on INSERT/UPDATE to `listings`, `posts`, `requests`
- **Model**: `Supabase.ai.Session('gte-small')` — runs natively in Supabase Edge Runtime v1.36.0+
- **Output**: 384-dimensional normalized vectors stored in each table's `embedding` column
- **Architecture**: Content → gte-small → vector → pgvector column (fully async, no user-facing latency)

### `search`
- **Endpoint**: `POST /functions/v1/search`
- **Input**: `{ search, neighborhood_id, match_threshold?, limit? }`
- **Flow**: Query text → gte-small embedding → `semantic_search` RPC → pgvector similarity results
- **Index**: HNSW with inner product ops for fast approximate nearest neighbor search

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env template and fill in your Supabase credentials
cp .env.local.example .env.local

# Run database migrations (in order)
# Run each file in supabase/migrations/ against your Supabase SQL Editor

# Seed data
# Run each file in supabase/seed/ against your Supabase SQL Editor

# Deploy Edge Functions
supabase functions deploy generate-embedding
supabase functions deploy search

# Set up Database Webhooks in Supabase Dashboard:
# - listings INSERT/UPDATE → generate-embedding
# - posts INSERT/UPDATE → generate-embedding
# - requests INSERT/UPDATE → generate-embedding

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── lib/
│   ├── supabase/         # Supabase client (browser, server, middleware)
│   └── utils.ts          # Shared utilities
├── middleware.ts          # Auth session refresh
supabase/
├── migrations/           # SQL migrations (00001–00007)
├── functions/            # Edge Functions
│   ├── generate-embedding/  # Auto-embedding on content changes
│   └── search/              # Semantic search endpoint
└── seed/                 # Seed data scripts
```

## Migrations

| File | Description |
|---|---|
| `00001_initial_schema.sql` | Core schema with all tables, RLS policies, extensions |
| `00002_map_rpc.sql` | Map listing RPC for neighborhood pins |
| `00003_enable_realtime.sql` | Realtime publication for live data |
| `00004_count_triggers.sql` | Automatic vote/comment count triggers |
| `00005_search_functions.sql` | Full-text search indexes and `search_neighborhood` RPC |
| `00006_cron_and_reputation.sql` | pg_cron jobs for borrows, alerts, reputation |
| `00007_semantic_search.sql` | HNSW vector indexes + `semantic_search` RPC |
