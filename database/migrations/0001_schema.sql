-- Core types
create type role as enum ('admin','manager','staff');

-- Profiles / Auth
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique not null,
  role role not null default 'staff',
  department_id uuid,
  unit_id uuid,
  created_at timestamptz default now()
);

-- Org structure
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references departments(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table public.staff_assignments (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references profiles(id) on delete cascade,
  unit_id uuid references units(id) on delete cascade,
  role_in_unit text check (role_in_unit in ('nurse','doctor','tech','admin')),
  active boolean default true,
  created_at timestamptz default now(),
  unique (staff_id, unit_id)
);

-- Scheduling
create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) on delete cascade,
  staff_id uuid references profiles(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text check (status in ('scheduled','completed','cancelled')) default 'scheduled',
  created_by uuid references profiles(id),
  updated_at timestamptz default now()
);

create table public.swap_requests (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid references shifts(id) on delete cascade,
  from_staff_id uuid references profiles(id),
  to_staff_id uuid references profiles(id),
  status text check (status in ('pending','approved','declined','cancelled')) default 'pending',
  reason text,
  created_at timestamptz default now(),
  decided_by uuid references profiles(id)
);

-- Time tracking
create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references profiles(id) on delete cascade,
  shift_id uuid references shifts(id) on delete set null,
  clock_in timestamptz not null,
  clock_out timestamptz,
  method text check (method in ('manual','geo','qr')) default 'manual',
  created_at timestamptz default now()
);

-- Credentials & licenses
create table public.credentials (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references profiles(id) on delete cascade,
  type text not null,
  license_number text,
  issued_by text,
  issued_at date,
  expires_at date,
  document_url text,
  status text check (status in ('valid','expiring','expired','suspended')) default 'valid',
  created_at timestamptz default now()
);

-- Time off
create table public.time_off_requests (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  type text check (type in ('vacation','sick','unpaid','other')) default 'other',
  status text check (status in ('pending','approved','declined','cancelled')) default 'pending',
  reason text,
  decided_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  action_url text,
  created_at timestamptz default now()
);

-- Settings
create table public.settings (
  id int primary key default 1,
  timezone text default 'UTC',
  overtime_threshold_minutes int default 480,
  geo_fencing jsonb,
  created_at timestamptz default now()
);

-- Reporting view
create view public.shift_utilization as
  select unit_id,
         date_trunc('day', start_at) as day,
         count(*) as shifts,
         sum((extract(epoch from (end_at - start_at)) / 3600)) as hours
  from shifts
  group by 1, 2;
