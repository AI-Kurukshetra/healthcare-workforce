# Staff management module

Tracks staff profiles, skills, credentials, availability, and contact details in Supabase with role-aware server actions and UI.

## Schema (Supabase)
- Tables: `staff`, `skills`, `staff_skills`, `credentials` (see `database/migrations/0003_staff_module.sql`).
- Views: `staff_skill_matrix`, `credential_alerts` (see `database/migrations/0006_staff_management_enhancements.sql`).
- Availability shape: `[ { day: 'mon', ranges: [ { start: '07:00', end: '15:00' } ] } ]`.
- Credential alert window: 45 days before expiry; `alert_level` is `expiring_soon` or `expired`.

### RLS highlights (`database/policies/rls.sql`)
- Staff can read/update their own `staff`, `staff_skills`, and `credentials` rows.
- Managers/Admins can CRUD `staff`, `skills`, `staff_skills`, `credentials`.
- `skills` readable by all roles; `staff`/`credentials` scoped by user id unless manager/admin.

## Server actions (`modules/staff/actions.ts`)
- `upsertStaffProfile` – create/update staff record with contact, availability, emergency contact.
- `updateStaffContact` – update phone/title/shift preference/emergency contact.
- `updateAvailability` – save availability JSON.
- `upsertStaffSkill` / `removeStaffSkill` – manage catalogued skills with level, certification number, expiry.
- `upsertCredential` / `deleteCredential` – CRUD credentials with issued/expiry dates and status.

## Server queries (`modules/staff/queries.ts`, `modules/credentials/queries.ts`)
- `listStaff()` – directory-ready list with availability + skills.
- `getStaffById(id)` – detailed profile with contact, availability, skills, credentials.
- `getSkillMatrix()` – combined staff + skill coverage for the matrix UI.
- `listCredentialAlerts()` – credentials expiring/expired (45-day window).
- `listCredentials()` – credential board with holder names.

## UI
- Directory: `app/staff/page.tsx` uses `StaffDirectory`.
- Profile: `app/staff/[id]/page.tsx` uses `StaffProfile` (contact, availability, skills, credentials).
- Skill matrix: `app/staff/skills/page.tsx` with `SkillMatrix` component.
- Credential alerts + board: `app/credentials/page.tsx` combining `CredentialAlerts` and `CredentialsBoard`.

## Usage notes
- Skill levels: `novice | intermediate | advanced | expert`.
- Credential status options: `valid | expiring | expired | suspended` (alerts computed separately via view).
- Revalidation targets: staff detail pages (`/staff/[id]`), directory (`/staff`), and credentials (`/credentials`) are refreshed by the server actions.
