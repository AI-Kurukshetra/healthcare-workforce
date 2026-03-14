-- Staff management enhancements: skill matrix + credential alerts
create or replace view public.staff_skill_matrix as
select
  p.id as staff_id,
  p.full_name,
  p.role,
  st.title,
  st.phone,
  st.shift_preference,
  ss.skill_id,
  s.name as skill_name,
  s.category,
  ss.level,
  ss.certification_number,
  ss.expires_at,
  ss.created_at
from public.staff_skills ss
join public.skills s on s.id = ss.skill_id
join public.profiles p on p.id = ss.staff_id
join public.staff st on st.id = ss.staff_id
order by p.full_name, s.name;

comment on view public.staff_skill_matrix is 'Flattened staff-to-skill matrix for dashboard and reporting.';

create or replace view public.credential_alerts as
select
  c.id,
  c.staff_id,
  p.full_name,
  c.type,
  c.license_number,
  c.status,
  c.expires_at,
  greatest(
    0,
    floor(extract(epoch from (c.expires_at::timestamp - now())) / 86400)
  ) as days_remaining,
  case
    when c.expires_at is null then 'none'
    when c.expires_at < now()::date then 'expired'
    when c.expires_at < (now() + interval '45 days')::date then 'expiring_soon'
    else 'ok'
  end as alert_level
from public.credentials c
left join public.profiles p on p.id = c.staff_id
order by c.expires_at nulls last;

comment on view public.credential_alerts is 'Credentials that are expired or approaching expiry with days remaining.';

-- Helpful indexes
create index if not exists idx_staff_skills_staff on public.staff_skills (staff_id);
create index if not exists idx_staff_skills_skill on public.staff_skills (skill_id);
create index if not exists idx_credentials_expires_at on public.credentials (expires_at);
