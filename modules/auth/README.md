# Auth Module

Features
- Email/password login and signup (Supabase Auth).
- Role-based access (Admin, Manager, Staff) backed by `roles` and `user_roles`.
- Session management via `@supabase/auth-helpers-nextjs`.
- Protected routes enforced in `app/middleware.ts`.

Routes
- `/signin` (app/(auth)/signin/page.tsx)
- `/signup` (app/(auth)/signup/page.tsx)

Key files
- `actions.ts` – server actions `signIn`, `signUp`.
- `queries.ts` – `getSessionWithRole` helper.
- `validation.ts` – Zod schema for auth input.
- `app/middleware.ts` – protects routes, injects `role` cookie.

Supabase schema
- `roles(id, slug, name)` seeded with admin/manager/staff.
- `user_roles(user_id, role_id)` linking Auth users to roles.

RLS
- `roles`: select all; writes admin only.
- `user_roles`: select self or admin; insert/delete admin only.

Usage
- After signup, default role is staff unless a role is chosen on the signup form.
- Middleware redirects unauthenticated users to `/signin?redirect=/original`.
- Access the role in server components via `cookies().get("role")?.value`.
