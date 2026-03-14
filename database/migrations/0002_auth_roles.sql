-- Roles table and mapping
create table if not exists public.roles (
  id serial primary key,
  slug text unique not null check (slug in ('admin','manager','staff')),
  name text not null
);

create table if not exists public.user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role_id int references roles(id) on delete cascade,
  primary key (user_id, role_id)
);

-- Seed default roles
insert into public.roles (slug, name)
values ('admin', 'Admin'), ('manager', 'Manager'), ('staff', 'Staff')
on conflict (slug) do nothing;
