# TopDeck

A full-stack SaaS marketplace connecting clients with service providers, built on Next.js + Supabase. Provider storefronts (`/professionals/{slug}`) are server-rendered with per-page metadata, JSON-LD, and a sitemap so they're discoverable on Google by store name.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query
- **Backend:** Supabase (Auth via `@supabase/ssr`, PostgreSQL, RLS, Storage)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env` and add your project URL and anon key
3. Run the migrations in `supabase/migrations/` in order, via the Supabase SQL Editor (or `supabase db push` once linked)

### 3. Run the dev server

```bash
npm run dev
```

## Project structure

```
app/
├── (public)/        # Storefronts, listing, home, static marketing pages — SEO surface
├── (auth-forms)/     # Login, signup, reset-password
├── (app)/            # Authenticated dashboards, guarded by middleware.ts
├── sitemap.ts, robots.ts
middleware.ts         # Centralized auth guard for the (app) route group
src/
├── components/       # Shared UI and layout components
│   ├── layout/     # Navbar, PaddedShell
│   └── ui/         # shadcn/ui primitives
├── features/       # Feature-based modules
│   ├── auth/       # AuthContext, login/signup/reset forms
│   ├── client/     # Client dashboard
│   ├── home/       # Landing page sections
│   ├── provider/   # Provider dashboard, storefront, onboarding
│   └── settings/   # Account settings
├── lib/
│   ├── supabase/   # Browser/server/middleware Supabase clients
│   ├── data/       # Server-side data fetchers (cache()-wrapped)
│   └── slug.ts     # Storefront slug generation
└── types/          # TypeScript types
```

## Roles

| Role | Access |
|------|--------|
| `client` | Browse, save, book, review |
| `provider` | Store profile, services, bookings |
| `support_*` | Internal ticket system |

## Routes

| Path | Access |
|------|--------|
| `/`, `/professionals`, `/professionals/{slug}` | Public, indexed |
| `/how-it-works`, `/call-outs`, `/for-professionals`, `/help` | Public, indexed |
| `/login`, `/signup`, `/reset-password` | Public, not indexed |
| `/dashboard`, `/my-bookings`, `/settings` | Authenticated (client) |
| `/provider`, `/provider/*` | Authenticated (provider) |

## Security

All database tables use Row Level Security (RLS). Policies enforce role-based access at the database level — never bypass RLS from the frontend.
claude --resume 9d41d5e4-316a-41a4-a342-b448fbe84d1f
