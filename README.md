# Stoop

Neighborhood Memory & Connection Platform for Philadelphia.

Named after the iconic front stoops where neighbors gather to talk, share news, and look out for each other. Stoop brings that experience online — with real-time feeds, community events, safety alerts, and AI-powered neighborhood memory.

Built for the [Good Neighbors Hackathon](https://indyhall.org/goodneighbors/) at Indy Hall.

## Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, MapLibre GL
- **Backend**: Supabase (Auth, Database, RLS, Realtime, Edge Functions, Storage, Webhooks)
- **AI**: pgvector + OpenAI embeddings for semantic "Neighborhood Memory" search
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
| Edge Functions | Embedding generation, semantic search, reputation |
| Database Webhooks | Trigger Edge Functions on INSERT |
| Storage | Photo attachments with RLS |
| pgvector | Semantic search over neighborhood posts |
| PostGIS | Neighborhood boundary assignment |
| pg_cron | Alert archival, reputation decay |
| RPC Functions | Vector search, leaderboard, geo-assignment |

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env template and fill in your Supabase credentials
cp .env.local.example .env.local

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
├── migrations/           # SQL migrations
└── functions/            # Edge Functions
```
