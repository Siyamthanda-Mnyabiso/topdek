# TopDeck

A full-stack SaaS marketplace connecting clients with service providers, built on React + Supabase.

## Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS v4, shadcn/ui, React Router, TanStack Query
- **Backend:** Supabase (Auth, PostgreSQL, RLS, Storage)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env` and add your project URL and anon key
3. Run the migration in `supabase/migrations/001_initial_schema.sql` via the Supabase SQL Editor

### 3. Run the dev server

```bash
npm run dev
```

## Project structure

```
src/
├── components/       # Shared UI and layout components
│   ├── layout/     # Navbar, AppLayout, RoleGuard
│   └── ui/         # shadcn/ui primitives
├── features/       # Feature-based modules
│   ├── auth/       # AuthContext, login, signup
│   ├── client/     # Client dashboard
│   ├── home/       # Landing page
│   ├── provider/   # Provider dashboard & onboarding
│   └── support/    # Internal support dashboard
├── lib/            # Supabase client, roles, utils
├── routes/         # React Router config
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
| `/` | Public |
| `/login`, `/signup` | Public |
| `/client` | Client only |
| `/provider`, `/provider/setup` | Provider only |
| `/support` | Support staff only |

## Security

All database tables use Row Level Security (RLS). Policies enforce role-based access at the database level — never bypass RLS from the frontend.
