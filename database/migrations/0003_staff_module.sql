-- Staff module schema
create extension if not exists moddatetime;

-- Main staff table (extends profiles with operational details)
create table if not exists public.staff (
  id uuid primary key references profiles(id) on delete cascade,
  title text,
  phone text,
  shift_preference text,
  availability jsonb, -- [{ day: 'mon', ranges: [{ start: '07:00', end: '15:00' }]}]
  emergency_contact jsonb, -- { name, relationship, phone }
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger staff_updated_at
before update on public.staff
for each row execute procedure moddatetime (updated_at);

-- Skills catalog
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text,
  description text,
  created_at timestamptz default now()
);

-- Staff to skills mapping
create table if not exists public.staff_skills (
  staff_id uuid references staff(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  level text check (level in ('novice','intermediate','advanced','expert')) default 'intermediate',
  certification_number text,
  expires_at date,
  primary key (staff_id, skill_id),
  created_at timestamptz default now()
);

comment on table public.staff is 'Operational staff profile and contact details.';
comment on table public.skills is 'Skill and certification catalog.';
comment on table public.staff_skills is 'Many-to-many mapping of staff to skills/certifications.';
