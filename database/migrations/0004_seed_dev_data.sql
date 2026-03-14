-- Seed realistic development data for healthcare-workforce
-- Safe to re-run; uses deterministic UUIDs and ON CONFLICT guards.
-- Assumes pgcrypto extension (for crypt / gen_salt) is available (default in Supabase).

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------
-- Organization structure
insert into public.departments (id, name)
values
  ('950b8cb8-6745-4e13-88d8-dfb98b20651f', 'Emergency Medicine'),
  ('3e032828-ab0a-4633-b4c1-3da9e1170266', 'Surgery'),
  ('030bc006-be30-40d0-9d03-d37b57a0c09b', 'Pediatrics')
on conflict (id) do nothing;

insert into public.units (id, department_id, name)
values
  ('4ffe6165-009e-4524-985c-ca3668cb33a8', '950b8cb8-6745-4e13-88d8-dfb98b20651f', 'ED - East'),
  ('ee835d93-2aea-4c6b-836d-a498db2f71a4', '950b8cb8-6745-4e13-88d8-dfb98b20651f', 'ED - West'),
  ('6f333308-4efe-44d3-a8a6-05ab6ed16023', '3e032828-ab0a-4633-b4c1-3da9e1170266', 'OR Suite A'),
  ('c0cc3607-ea2a-4d86-86b1-93b3c8be069e', '3e032828-ab0a-4633-b4c1-3da9e1170266', 'OR Suite B'),
  ('443a2df2-d10a-43d1-a214-77e9bb374c9f', '030bc006-be30-40d0-9d03-d37b57a0c09b', 'Pediatrics General'),
  ('a671d523-7a96-4966-b171-0446ff78bb2a', '030bc006-be30-40d0-9d03-d37b57a0c09b', 'Pediatric ICU (PICU)')
on conflict (id) do nothing;

-- -------------------------------------------------------------------
-- Users, profiles, staff
with base_users as (
  -- id, email, full_name, role, dept_name, unit_name, title, phone, shift_pref, availability_json, emergency_json
  select * from (values
    ('68604b21-4532-4dac-b83b-19461d75cb3b', 'alex.morgan@nightingale.test',  'Alex Morgan',   'admin',   'Emergency Medicine', 'ED - East',           'Director of Nursing',   '555-2001', 'days',
      '[{"day":"mon","ranges":[{"start":"08:00","end":"16:00"}]},{"day":"wed","ranges":[{"start":"08:00","end":"16:00"}]}]',
      '{"name":"Jamie Morgan","relationship":"Spouse","phone":"555-8000"}'),
    ('1c3b6cff-7770-4cf8-adb5-ebfb4a54f183', 'jordan.smith@nightingale.test', 'Jordan Smith',  'manager', 'Emergency Medicine', 'ED - West',           'ED Nurse Manager',      '555-2002', 'nights',
      '[{"day":"mon","ranges":[{"start":"18:00","end":"02:00"}]},{"day":"fri","ranges":[{"start":"18:00","end":"02:00"}]}]',
      '{"name":"Pat Smith","relationship":"Sibling","phone":"555-8001"}'),
    ('6bccb8e5-49e5-4c35-a0b2-6e73a89aee25', 'casey.chen@nightingale.test',   'Casey Chen, RN','staff',   'Emergency Medicine', 'ED - East',           'Registered Nurse',      '555-3001', 'days',
      '[{"day":"tue","ranges":[{"start":"07:00","end":"15:00"}]},{"day":"thu","ranges":[{"start":"07:00","end":"15:00"}]}]',
      '{"name":"Lily Chen","relationship":"Parent","phone":"555-8002"}'),
    ('08b05912-b743-46d3-a31a-584c8b1ecb37', 'priya.kapoor@nightingale.test', 'Dr. Priya Kapoor','staff',  'Surgery',            'OR Suite A',          'Attending Surgeon',     '555-4001', 'day-shift',
      '[{"day":"wed","ranges":[{"start":"09:00","end":"17:00"}]},{"day":"sat","ranges":[{"start":"09:00","end":"17:00"}]}]',
      '{"name":"Arjun Kapoor","relationship":"Spouse","phone":"555-8003"}'),
    ('6b466e8e-554b-4fc4-882d-96e5958e78de', 'taylor.brooks@nightingale.test','Taylor Brooks', 'staff',   'Pediatrics',         'Pediatric ICU (PICU)','Respiratory Therapist', '555-5001', 'nights',
      '[{"day":"thu","ranges":[{"start":"19:00","end":"07:00"}]},{"day":"sun","ranges":[{"start":"19:00","end":"07:00"}]}]',
      '{"name":"Renee Brooks","relationship":"Partner","phone":"555-8004"}'),
    ('72e9e882-eda7-4dfb-adfd-be3fd96c7014', 'samira.lee@nightingale.test',   'Samira Lee',    'staff',   'Pediatrics',         'Pediatrics General',  'Float RN',              '555-6001', 'weekends',
      '[{"day":"sat","ranges":[{"start":"07:00","end":"19:00"}]},{"day":"sun","ranges":[{"start":"07:00","end":"19:00"}]}]',
      '{"name":"Chris Lee","relationship":"Partner","phone":"555-8005"}')
  ) as t(id, email, full_name, role, dept_name, unit_name, title, phone, shift_pref, availability_json, emergency_json)
),
auth_seed as (
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  select id,
         '00000000-0000-0000-0000-000000000000',
         'authenticated',
         'authenticated',
         email,
         crypt('Password123!', gen_salt('bf')),
         now(),
         jsonb_build_object('provider','email'),
         jsonb_build_object('full_name', full_name)
  from base_users
  on conflict (id) do nothing
),
profile_seed as (
  insert into public.profiles (id, full_name, email, role, department_id, unit_id)
  select b.id, b.full_name, b.email, b.role::role, d.id, u.id
  from base_users b
  join public.departments d on d.name = b.dept_name
  left join public.units u on u.name = b.unit_name
  on conflict (id) do nothing
  returning id, role
),
staff_seed as (
  insert into public.staff (id, title, phone, shift_preference, availability, emergency_contact)
  select b.id, b.title, b.phone, b.shift_pref, b.availability_json::jsonb, b.emergency_json::jsonb
  from base_users b
  on conflict (id) do nothing
)
insert into public.user_roles (user_id, role_id)
select p.id, r.id
from profile_seed p
join public.roles r on r.slug = p.role::text
on conflict do nothing;

-- -------------------------------------------------------------------
-- Staff assignments
insert into public.staff_assignments (staff_id, unit_id, role_in_unit, active)
values
  ('6bccb8e5-49e5-4c35-a0b2-6e73a89aee25', '4ffe6165-009e-4524-985c-ca3668cb33a8', 'nurse', true),
  ('1c3b6cff-7770-4cf8-adb5-ebfb4a54f183', 'ee835d93-2aea-4c6b-836d-a498db2f71a4', 'admin', true),
  ('08b05912-b743-46d3-a31a-584c8b1ecb37', '6f333308-4efe-44d3-a8a6-05ab6ed16023', 'doctor', true),
  ('6b466e8e-554b-4fc4-882d-96e5958e78de', 'a671d523-7a96-4966-b171-0446ff78bb2a', 'tech', true),
  ('72e9e882-eda7-4dfb-adfd-be3fd96c7014', '443a2df2-d10a-43d1-a214-77e9bb374c9f', 'nurse', true)
on conflict (staff_id, unit_id) do nothing;

-- -------------------------------------------------------------------
-- Skills catalog and mappings
with skill_rows as (
  insert into public.skills (name, category, description)
  values
    ('BLS', 'Certification', 'Basic Life Support current card'),
    ('ACLS', 'Certification', 'Advanced Cardiovascular Life Support'),
    ('PALS', 'Certification', 'Pediatric Advanced Life Support'),
    ('Ventilator Management', 'Respiratory', 'Competency in ventilator modes, alarms, and troubleshooting'),
    ('Trauma Nurse Core Course', 'Emergency', 'TNCC completion within last 2 years'),
    ('Laparoscopic Surgery', 'Surgery', 'Minimally invasive surgical techniques and equipment'),
    ('Airway Management', 'Critical Care', 'Rapid sequence intubation, airway adjuncts, and suctioning')
  on conflict (name) do update set description = excluded.description
  returning id, name
)
insert into public.staff_skills (staff_id, skill_id, level, certification_number, expires_at)
select * from (
  values
    ('6bccb8e5-49e5-4c35-a0b2-6e73a89aee25', 'BLS',  'advanced',     'RN-BLS-45822',   '2026-05-01'),
    ('6bccb8e5-49e5-4c35-a0b2-6e73a89aee25', 'ACLS', 'advanced',     'RN-ACLS-88421',  '2025-11-01'),
    ('6bccb8e5-49e5-4c35-a0b2-6e73a89aee25', 'Trauma Nurse Core Course','intermediate','RN-TNCC-33211','2026-08-15'),
    ('1c3b6cff-7770-4cf8-adb5-ebfb4a54f183', 'BLS',  'advanced',     'EDM-BLS-90110',  '2026-02-01'),
    ('1c3b6cff-7770-4cf8-adb5-ebfb4a54f183', 'ACLS', 'advanced',     'EDM-ACLS-90110', '2026-02-01'),
    ('08b05912-b743-46d3-a31a-584c8b1ecb37', 'Laparoscopic Surgery','expert','SURG-LAP-55221','2027-02-15'),
    ('08b05912-b743-46d3-a31a-584c8b1ecb37', 'Airway Management',    'advanced','SURG-AIR-12001','2026-12-31'),
    ('6b466e8e-554b-4fc4-882d-96e5958e78de', 'Ventilator Management','expert','RT-VENT-77531','2026-09-01'),
    ('6b466e8e-554b-4fc4-882d-96e5958e78de', 'Airway Management',    'advanced','RT-AIR-88012', '2025-12-01'),
    ('72e9e882-eda7-4dfb-adfd-be3fd96c7014', 'PALS', 'advanced',     'RN-PALS-66120',  '2027-04-01')
) as m(staff_id, skill_name, level, cert_no, expires_at)
join skill_rows s on s.name = m.skill_name
on conflict (staff_id, skill_id) do nothing;

-- -------------------------------------------------------------------
-- Credentials & licenses
insert into public.credentials (id, staff_id, type, license_number, issued_by, issued_at, expires_at, status)
values
  ('88416cb8-7e92-49b3-a14e-30cf0091d5ed', '6bccb8e5-49e5-4c35-a0b2-6e73a89aee25', 'Registered Nurse License', 'RN-45822', 'State Board of Nursing', '2022-05-15', '2025-05-15', 'valid'),
  ('f26dd726-bf90-4435-80a5-101d847eb615', '6bccb8e5-49e5-4c35-a0b2-6e73a89aee25', 'ACLS Provider', 'ACLS-88421', 'American Heart Association', '2024-11-10', '2026-11-10', 'valid'),
  ('466dd01a-9510-46f6-a01d-85666fe6c16c', '08b05912-b743-46d3-a31a-584c8b1ecb37', 'Medical License', 'MD-90210', 'State Medical Board', '2020-03-01', '2026-03-01', 'valid'),
  ('7e5e4f4c-4b9c-4470-a71a-e47446ba2106', '08b05912-b743-46d3-a31a-584c8b1ecb37', 'Board Certified - General Surgery', 'ABS-55321', 'American Board of Surgery', '2021-07-01', '2031-07-01', 'valid'),
  ('b21a1947-88fb-4ca1-936d-93897bce2475', '6b466e8e-554b-4fc4-882d-96e5958e78de', 'Respiratory Therapist License', 'RT-77531', 'NBRC', '2023-02-01', '2025-02-01', 'expiring')
on conflict (id) do nothing;

-- -------------------------------------------------------------------
-- Shifts (anchored to "today" at runtime)
with params as (select date_trunc('day', now()) as day0)
insert into public.shifts (id, unit_id, staff_id, start_at, end_at, status, created_by)
select * from (
  select '3eef77ef-ab88-4a6b-855b-7823441c844d'::uuid, '4ffe6165-009e-4524-985c-ca3668cb33a8'::uuid, '6bccb8e5-49e5-4c35-a0b2-6e73a89aee25'::uuid,
         day0 + interval '08 hour', day0 + interval '16 hour', 'completed'::text, '1c3b6cff-7770-4cf8-adb5-ebfb4a54f183'::uuid
  union all
  select '6fe85b44-a93e-47ac-976e-8ccee96ee61a', 'ee835d93-2aea-4c6b-836d-a498db2f71a4', '6bccb8e5-49e5-4c35-a0b2-6e73a89aee25',
         day0 + interval '18 hour', day0 + interval '26 hour', 'scheduled', '1c3b6cff-7770-4cf8-adb5-ebfb4a54f183'
  union all
  select '595087d9-58f0-451d-b348-8329a288aa52', '6f333308-4efe-44d3-a8a6-05ab6ed16023', '08b05912-b743-46d3-a31a-584c8b1ecb37',
         day0 + interval '09 hour', day0 + interval '15 hour', 'completed', '68604b21-4532-4dac-b83b-19461d75cb3b'
  union all
  select 'ad449dd7-b802-4da6-a676-e89daaf4bcc5', '443a2df2-d10a-43d1-a214-77e9bb374c9f', '72e9e882-eda7-4dfb-adfd-be3fd96c7014',
         day0 + interval '07 hour', day0 + interval '15 hour', 'scheduled', '1c3b6cff-7770-4cf8-adb5-ebfb4a54f183'
  union all
  select '854a5a35-9159-494c-9425-facb63188fa8', 'a671d523-7a96-4966-b171-0446ff78bb2a', '6b466e8e-554b-4fc4-882d-96e5958e78de',
         day0 + interval '19 hour', day0 + interval '27 hour', 'completed', '1c3b6cff-7770-4cf8-adb5-ebfb4a54f183'
  union all
  select 'be97bd2c-9e63-497f-8c35-cb6ec2fb521c', 'c0cc3607-ea2a-4d86-86b1-93b3c8be069e', '08b05912-b743-46d3-a31a-584c8b1ecb37',
         day0 + interval '33 hour', day0 + interval '41 hour', 'cancelled', '68604b21-4532-4dac-b83b-19461d75cb3b'
) s
cross join params
on conflict (id) do nothing;

-- -------------------------------------------------------------------
-- Time entries (clock-ins)
insert into public.time_entries (id, staff_id, shift_id, clock_in, clock_out, method)
values
  ('c6dd02be-d2f9-43ee-bbbf-c07795f3aa52', '6bccb8e5-49e5-4c35-a0b2-6e73a89aee25', '3eef77ef-ab88-4a6b-855b-7823441c844d',
    date_trunc('day', now()) + interval '07 hour 55 minute',
    date_trunc('day', now()) + interval '16 hour 05 minute',
    'qr'),
  ('8b6c184f-f82b-4956-ae91-00ff534c7982', '08b05912-b743-46d3-a31a-584c8b1ecb37', '595087d9-58f0-451d-b348-8329a288aa52',
    date_trunc('day', now()) + interval '08 hour 50 minute',
    date_trunc('day', now()) + interval '15 hour 10 minute',
    'manual'),
  ('b755f97b-adc2-47c5-8013-f88f6114a736', '6b466e8e-554b-4fc4-882d-96e5958e78de', '854a5a35-9159-494c-9425-facb63188fa8',
    date_trunc('day', now()) + interval '18 hour 50 minute',
    date_trunc('day', now()) + interval '27 hour 05 minute',
    'geo')
on conflict (id) do nothing;

-- -------------------------------------------------------------------
-- Swap requests
insert into public.swap_requests (id, shift_id, from_staff_id, to_staff_id, status, reason, created_at)
values
  ('dfc1e84c-4dbc-45c8-bef7-510c94866d22', '6fe85b44-a93e-47ac-976e-8ccee96ee61a',
   '6bccb8e5-49e5-4c35-a0b2-6e73a89aee25', '72e9e882-eda7-4dfb-adfd-be3fd96c7014',
   'pending', 'Family appointment after day shift, requesting swap to float RN', now() - interval '1 day')
on conflict (id) do nothing;

-- -------------------------------------------------------------------
-- Time off requests
insert into public.time_off_requests (id, staff_id, start_date, end_date, type, status, reason, decided_by)
values
  ('6b282da1-344e-42c6-96ec-92be2b566ba6', '6b466e8e-554b-4fc4-882d-96e5958e78de',
   current_date + 3, current_date + 4, 'sick', 'approved', 'Post-shift fatigue; covering with agency RT', '1c3b6cff-7770-4cf8-adb5-ebfb4a54f183')
on conflict (id) do nothing;

-- -------------------------------------------------------------------
-- Notifications
insert into public.notifications (id, recipient_id, title, body, action_url)
values
  ('7bebae13-dbf6-49ee-a8f5-01f2c6f411ba', '6bccb8e5-49e5-4c35-a0b2-6e73a89aee25',
   'Swap request pending', 'Please review swap request for tonight''s ED - West shift.', '/shifts/6fe85b44-a93e-47ac-976e-8ccee96ee61a'),
  ('190263dd-51d2-4565-aaf6-c2a8902f16ad', '72e9e882-eda7-4dfb-adfd-be3fd96c7014',
   'New assignment', 'You are scheduled for Pediatrics General tomorrow 07:00-15:00.', '/shifts/ad449dd7-b802-4da6-a676-e89daaf4bcc5')
on conflict (id) do nothing;

-- -------------------------------------------------------------------
-- Settings (single row)
insert into public.settings (id, timezone, overtime_threshold_minutes, geo_fencing)
values (1, 'America/New_York', 480, '{"enabled": false}')
on conflict (id) do update set
  timezone = excluded.timezone,
  overtime_threshold_minutes = excluded.overtime_threshold_minutes,
  geo_fencing = excluded.geo_fencing;

