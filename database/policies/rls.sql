-- Enable RLS
alter table profiles enable row level security;
alter table departments enable row level security;
alter table units enable row level security;
alter table staff_assignments enable row level security;
alter table shifts enable row level security;
alter table swap_requests enable row level security;
alter table time_entries enable row level security;
alter table credentials enable row level security;
alter table time_off_requests enable row level security;
alter table notifications enable row level security;
alter table settings enable row level security;
alter table roles enable row level security;
alter table user_roles enable row level security;
alter table staff enable row level security;
alter table skills enable row level security;
alter table staff_skills enable row level security;

-- Profiles
create policy "profiles self read" on profiles
  for select using (auth.uid() = id or exists (select 1 from profiles p2 where p2.id = auth.uid() and p2.role in ('manager','admin')));
create policy "profiles admin service" on profiles
  for all using (auth.role() = 'service_role') with check (true);

-- Departments
create policy "departments read all" on departments for select using (true);
create policy "departments admin write" on departments for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin')));

-- Units
create policy "units read all" on units for select using (true);
create policy "units admin write" on units for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin')));

-- Shifts
create policy "shifts select scoped" on shifts for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
  or staff_id = auth.uid()
  or unit_id in (select unit_id from staff_assignments sa where sa.staff_id = auth.uid() and sa.active)
);
create policy "shifts insert managers" on shifts for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);
create policy "shifts update owner_or_manager" on shifts for update using (
  staff_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);

-- Swap Requests
create policy "swap select involved" on swap_requests for select using (
  from_staff_id = auth.uid() or to_staff_id = auth.uid() or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);
create policy "swap insert self" on swap_requests for insert with check (from_staff_id = auth.uid());
create policy "swap update involved_or_manager" on swap_requests for update using (
  from_staff_id = auth.uid() or to_staff_id = auth.uid() or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);

-- Time Entries
create policy "time_entries select owner_or_manager" on time_entries for select using (
  staff_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);
create policy "time_entries insert self" on time_entries for insert with check (staff_id = auth.uid());
create policy "time_entries update owner_or_manager" on time_entries for update using (
  staff_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);

-- Credentials
create policy "credentials select scoped" on credentials for select using (
  staff_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);
create policy "credentials write scoped" on credentials for all using (
  staff_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);

-- Time Off
create policy "timeoff select scoped" on time_off_requests for select using (
  staff_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);
create policy "timeoff insert self" on time_off_requests for insert with check (staff_id = auth.uid());
create policy "timeoff update scoped" on time_off_requests for update using (
  staff_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);

-- Notifications
create policy "notifications select self" on notifications for select using (recipient_id = auth.uid());
create policy "notifications insert any" on notifications for insert with check (true);
create policy "notifications update self" on notifications for update using (recipient_id = auth.uid());

-- Settings
create policy "settings admin only" on settings for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Roles (readable to all, write admin)
create policy "roles read" on roles for select using (true);
create policy "roles admin write" on roles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- User roles
create policy "user_roles select own_or_admin" on user_roles for select using (
  user_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "user_roles insert self_staff_or_admin" on user_roles for insert with check (
  (user_id = auth.uid() and role_id = (select id from roles where slug = 'staff'))
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "user_roles delete admin_only" on user_roles for delete using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Staff
create policy "staff select scoped" on staff for select using (
  id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);
create policy "staff insert admin_manager" on staff for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);
create policy "staff update self_or_manager" on staff for update using (
  id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);

-- Skills
create policy "skills read all" on skills for select using (true);
create policy "skills write admin_manager" on skills for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);

-- Staff skills
create policy "staff_skills select scoped" on staff_skills for select using (
  staff_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);
create policy "staff_skills insert admin_manager" on staff_skills for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);
create policy "staff_skills delete admin_manager" on staff_skills for delete using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('manager','admin'))
);
