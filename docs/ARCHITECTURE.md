# Architecture Overview

## Stack
- Next.js 14 App Router (server components by default, client where interaction is required)
- TypeScript, TailwindCSS, ShadCN UI
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Zod validation, server actions for mutations, Supabase client for data access

## Folder Structure
- `app/` – routes (feature-aligned pages, server components first)
- `modules/<feature>/` – actions, queries, validation, components, README per feature
- `components/` – shared UI building blocks
- `lib/` – supabase clients, auth helpers, utilities
- `database/` – migrations and RLS policies
- `docs/` – ERD and architecture docs

## Patterns
- **Data access**: `lib/supabase/server.ts` for server components/actions, `lib/supabase/client.ts` for client components.
- **Mutations**: server actions colocated in `modules/<feature>/actions.ts`; use Zod to validate inputs.
- **Authorization**: role stored in `profiles.role`; middleware should gate routes by role; RLS enforces DB-level protections.
- **Realtime**: subscribe to `shifts`, `swap_requests`, `notifications`, `time_entries` channels when client interactivity is needed.
- **UI**: ShadCN form primitives with Zod resolver, Tailwind for layout. Mobile-first responsive layouts.

## Roles
- `admin`: full access
- `manager`: manage departments/units/staff within scope, approve swaps/timeoff, manage schedules
- `staff`: self-service (view schedule, request swaps/time off, clock in/out, manage credentials)

## Next Steps
1) Run migrations in `database/migrations/0001_schema.sql`.
2) Apply `database/policies/rls.sql`.
3) Generate typed client: `supabase gen types typescript --linked > types/db.ts`.
4) Build components per module starting from provided stubs.
