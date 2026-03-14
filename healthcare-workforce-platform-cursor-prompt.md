# Healthcare Workforce Intelligence Platform
## Complete Cursor Build Prompt — Next.js + Supabase

---

## 1. PROJECT OVERVIEW

Build a **Healthcare Workforce Intelligence Platform** — a full-stack web application for healthcare organizations to manage staff scheduling, compliance, credentialing, time tracking, and workforce analytics. The platform serves three user roles: **Staff**, **Manager**, and **Admin/Executive**.

**Tech Stack:**
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **State Management:** Zustand or React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts or Tremor
- **Calendar/Scheduling:** FullCalendar or react-big-calendar
- **Mobile:** Responsive-first; PWA support via next-pwa
- **Notifications:** Supabase Realtime + browser push notifications

---

## 2. SUPABASE DATABASE SCHEMA

Create all tables with Row Level Security (RLS) enabled. Run these migrations in order.

### 2.1 Core Tables

```sql
-- Organizations / Health Systems
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('hospital', 'clinic', 'health_system', 'ltc')),
  address JSONB,
  timezone TEXT DEFAULT 'America/New_York',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Facilities (hospitals/locations within an organization)
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address JSONB,
  timezone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Departments / Units
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  type TEXT CHECK (type IN ('icu', 'er', 'med_surg', 'pediatrics', 'oncology', 'or', 'labor_delivery', 'admin', 'other')),
  min_staffing_ratio JSONB DEFAULT '{}',
  parent_department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff Profiles
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  employee_id TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('rn', 'lpn', 'cna', 'np', 'pa', 'md', 'tech', 'admin', 'manager', 'director', 'other')),
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'per_diem', 'contract', 'travel')),
  department_id UUID REFERENCES departments(id),
  facility_id UUID REFERENCES facilities(id),
  hire_date DATE,
  hourly_rate NUMERIC(10,2),
  fte NUMERIC(3,2) DEFAULT 1.0,
  is_float_pool BOOLEAN DEFAULT false,
  availability JSONB DEFAULT '{}',
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Roles & Permissions
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('staff', 'charge_nurse', 'manager', 'director', 'admin', 'executive')),
  facility_id UUID REFERENCES facilities(id),
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Scheduling Tables

```sql
-- Shift Templates
CREATE TABLE shift_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours NUMERIC(4,2),
  shift_type TEXT CHECK (shift_type IN ('day', 'evening', 'night', 'weekend', 'holiday', 'on_call')),
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Schedules (published schedule periods)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  facility_id UUID REFERENCES facilities(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES staff(id),
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shifts (individual shift assignments)
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id),
  department_id UUID REFERENCES departments(id),
  facility_id UUID REFERENCES facilities(id),
  shift_template_id UUID REFERENCES shift_templates(id),
  shift_date DATE NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  is_overtime BOOLEAN DEFAULT false,
  is_on_call BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Open Shifts (unfilled shifts)
CREATE TABLE open_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  facility_id UUID REFERENCES facilities(id),
  shift_date DATE NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  required_role TEXT,
  required_skills TEXT[],
  bonus_pay NUMERIC(10,2),
  status TEXT CHECK (status IN ('open', 'filled', 'cancelled')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shift Swap Requests
CREATE TABLE shift_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES staff(id),
  requested_staff_id UUID REFERENCES staff(id),
  requester_shift_id UUID REFERENCES shifts(id),
  offered_shift_id UUID REFERENCES shifts(id),
  status TEXT CHECK (status IN ('pending', 'staff_approved', 'manager_approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  requester_reason TEXT,
  manager_notes TEXT,
  approved_by UUID REFERENCES staff(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 Time & Attendance Tables

```sql
-- Time Clock Entries
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id),
  shift_id UUID REFERENCES shifts(id),
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  break_minutes INTEGER DEFAULT 0,
  total_hours NUMERIC(5,2),
  is_overtime BOOLEAN DEFAULT false,
  location JSONB,
  ip_address INET,
  status TEXT CHECK (status IN ('active', 'completed', 'edited', 'disputed')) DEFAULT 'active',
  edited_by UUID REFERENCES staff(id),
  edit_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Break Tracking
CREATE TABLE breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE,
  break_start TIMESTAMPTZ NOT NULL,
  break_end TIMESTAMPTZ,
  break_type TEXT CHECK (break_type IN ('meal', 'rest', 'other')),
  duration_minutes INTEGER
);

-- Time-Off Requests
CREATE TABLE time_off_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id),
  request_type TEXT CHECK (request_type IN ('pto', 'sick', 'vacation', 'fmla', 'bereavement', 'jury', 'unpaid', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_hours NUMERIC(5,2),
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES staff(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PTO Balances
CREATE TABLE pto_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) UNIQUE,
  pto_hours NUMERIC(6,2) DEFAULT 0,
  sick_hours NUMERIC(6,2) DEFAULT 0,
  vacation_hours NUMERIC(6,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 Credentials & Compliance Tables

```sql
-- Credential Types
CREATE TABLE credential_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT,
  category TEXT CHECK (category IN ('license', 'certification', 'training', 'background_check', 'health')),
  is_required BOOLEAN DEFAULT false,
  renewal_period_days INTEGER,
  alert_days_before INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff Credentials
CREATE TABLE staff_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  credential_type_id UUID REFERENCES credential_types(id),
  license_number TEXT,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT CHECK (status IN ('active', 'expired', 'pending_renewal', 'revoked', 'pending_verification')) DEFAULT 'active',
  document_url TEXT,
  verified_by UUID REFERENCES staff(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Skills & Competencies
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT
);

CREATE TABLE staff_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id),
  proficiency_level TEXT CHECK (proficiency_level IN ('novice', 'competent', 'proficient', 'expert')),
  assessed_date DATE,
  assessed_by UUID REFERENCES staff(id),
  next_assessment_date DATE,
  notes TEXT
);

-- Staffing Ratio Requirements
CREATE TABLE staffing_ratios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  shift_type TEXT,
  role TEXT,
  min_staff INTEGER NOT NULL,
  max_patients INTEGER,
  effective_date DATE,
  regulation_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.5 Float Pool & Contract Staff

```sql
-- Float Pool Assignments
CREATE TABLE float_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id),
  from_department_id UUID REFERENCES departments(id),
  to_department_id UUID REFERENCES departments(id),
  shift_id UUID REFERENCES shifts(id),
  assignment_date DATE NOT NULL,
  status TEXT CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')) DEFAULT 'requested',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contract / Agency Staff
CREATE TABLE contract_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id),
  agency_name TEXT,
  contract_start DATE,
  contract_end DATE,
  bill_rate NUMERIC(10,2),
  pay_rate NUMERIC(10,2),
  contract_document_url TEXT,
  specialties TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.6 Patient Acuity & Census

```sql
-- Daily Census Records
CREATE TABLE census_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  recorded_at TIMESTAMPTZ NOT NULL,
  patient_count INTEGER NOT NULL,
  acuity_score NUMERIC(4,2),
  recorded_by UUID REFERENCES staff(id),
  notes TEXT
);

-- Acuity-Based Staffing Recommendations
CREATE TABLE acuity_staffing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  acuity_level TEXT CHECK (acuity_level IN ('low', 'moderate', 'high', 'critical')),
  acuity_score_min NUMERIC(4,2),
  acuity_score_max NUMERIC(4,2),
  recommended_rn INTEGER,
  recommended_lpn INTEGER,
  recommended_cna INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.7 Communication & Notifications

```sql
-- Shift Handoff Notes
CREATE TABLE handoff_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES shifts(id),
  staff_id UUID REFERENCES staff(id),
  department_id UUID REFERENCES departments(id),
  content TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('routine', 'important', 'urgent')) DEFAULT 'routine',
  acknowledged_by UUID[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  facility_id UUID REFERENCES facilities(id),
  department_id UUID REFERENCES departments(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'emergency')) DEFAULT 'normal',
  author_id UUID REFERENCES staff(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.8 Budget & Payroll

```sql
-- Budget Plans
CREATE TABLE budget_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  fiscal_year INTEGER NOT NULL,
  period TEXT CHECK (period IN ('annual', 'quarterly', 'monthly')),
  period_start DATE,
  period_end DATE,
  budgeted_hours NUMERIC(10,2),
  budgeted_cost NUMERIC(12,2),
  actual_hours NUMERIC(10,2),
  actual_cost NUMERIC(12,2),
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payroll Exports
CREATE TABLE payroll_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  exported_by UUID REFERENCES staff(id),
  file_url TEXT,
  record_count INTEGER,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Union Contracts
CREATE TABLE union_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  union_name TEXT NOT NULL,
  contract_start DATE,
  contract_end DATE,
  rules JSONB DEFAULT '{}',
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.9 Emergency Staffing

```sql
-- Emergency Events
CREATE TABLE emergency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id),
  event_type TEXT CHECK (event_type IN ('mass_casualty', 'surge', 'weather', 'system_failure', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'resolved', 'cancelled')) DEFAULT 'active',
  initiated_by UUID REFERENCES staff(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Emergency Staff Responses
CREATE TABLE emergency_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES emergency_events(id),
  staff_id UUID REFERENCES staff(id),
  response TEXT CHECK (response IN ('available', 'unavailable', 'on_way', 'arrived')),
  responded_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);
```

---

## 3. SUPABASE CONFIGURATION

### 3.1 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
-- (repeat for all tables)

-- Staff can view their own profile
CREATE POLICY "Staff view own profile" ON staff
  FOR SELECT USING (auth.uid() = user_id);

-- Managers can view staff in their department
CREATE POLICY "Managers view department staff" ON staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('manager', 'director', 'admin')
      AND ur.department_id = staff.department_id
    )
  );

-- Staff can view their own shifts
CREATE POLICY "Staff view own shifts" ON shifts
  FOR SELECT USING (
    staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
  );

-- Managers can CRUD shifts in their department
CREATE POLICY "Managers manage shifts" ON shifts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('manager', 'director', 'admin')
    )
  );

-- Staff can view their own time entries
CREATE POLICY "Staff view own time entries" ON time_entries
  FOR SELECT USING (
    staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
  );
```

### 3.2 Supabase Realtime

Enable Realtime on: `shifts`, `notifications`, `handoff_notes`, `emergency_events`, `open_shifts`

### 3.3 Supabase Storage Buckets

```
- avatars (public read, authenticated write)
- credentials (private, authenticated read/write)
- contracts (private)
- exports (private)
- announcements (public read)
```

### 3.4 Edge Functions

Create the following Supabase Edge Functions:

- `calculate-overtime` — run nightly, flag overtime entries
- `credential-expiry-alerts` — run daily, send notifications for expiring credentials
- `generate-schedule-suggestions` — AI-powered schedule optimization
- `payroll-export` — compile time entries into payroll format
- `staffing-ratio-check` — validate schedules against ratio requirements
- `emergency-broadcast` — push notifications to all eligible staff

---

## 4. NEXT.JS PROJECT STRUCTURE

```
/app
  /(auth)
    /login
    /register
    /forgot-password
  /(dashboard)
    /layout.tsx              ← sidebar + topnav layout
    /page.tsx                ← manager dashboard home
    /schedule
      /page.tsx              ← schedule calendar view
      /[id]/page.tsx         ← schedule detail
      /create/page.tsx       ← schedule builder
    /shifts
      /page.tsx              ← shift list/board
      /open/page.tsx         ← open shifts board
      /swaps/page.tsx        ← swap requests
    /staff
      /page.tsx              ← staff directory
      /[id]/page.tsx         ← staff profile
      /[id]/credentials      ← credential management
      /[id]/skills           ← skills matrix
      /new/page.tsx          ← add staff
    /time-attendance
      /page.tsx              ← time clock dashboard
      /timesheets/page.tsx   ← timesheet approval
      /time-off/page.tsx     ← time off requests
    /credentials
      /page.tsx              ← credential dashboard
      /alerts/page.tsx       ← expiry alerts
    /float-pool
      /page.tsx              ← float pool management
    /acuity
      /page.tsx              ← patient acuity & census
    /budget
      /page.tsx              ← budget planning
      /forecasting/page.tsx  ← labor forecasting
    /compliance
      /page.tsx              ← compliance dashboard
      /ratios/page.tsx       ← staffing ratios
      /union/page.tsx        ← union contract rules
    /reports
      /page.tsx              ← reports & analytics
    /emergency
      /page.tsx              ← emergency staffing
    /announcements
      /page.tsx              ← announcements
    /settings
      /page.tsx              ← org settings
      /departments           ← department management
      /facilities            ← facility management
      /payroll               ← payroll integration
  /(staff-portal)
    /layout.tsx              ← staff mobile-first layout
    /my-schedule/page.tsx    ← staff's own schedule
    /clock/page.tsx          ← clock in/out
    /time-off/page.tsx       ← request time off
    /swaps/page.tsx          ← swap requests
    /credentials/page.tsx    ← my credentials
    /profile/page.tsx        ← profile settings
/components
  /ui                        ← shadcn/ui components
  /layout
    Sidebar.tsx
    TopNav.tsx
    MobileNav.tsx
  /schedule
    ScheduleCalendar.tsx
    ShiftCard.tsx
    DragDropScheduler.tsx
    ShiftModal.tsx
    OpenShiftBoard.tsx
  /staff
    StaffDirectory.tsx
    StaffCard.tsx
    StaffProfile.tsx
    SkillsMatrix.tsx
    AvailabilityGrid.tsx
  /time-attendance
    TimeClock.tsx
    TimesheetTable.tsx
    TimeOffCalendar.tsx
    OvertimeAlert.tsx
  /credentials
    CredentialCard.tsx
    ExpiryAlert.tsx
    CredentialUpload.tsx
  /dashboard
    StaffingRatioWidget.tsx
    OvertimeCostWidget.tsx
    CensusWidget.tsx
    ComplianceScoreWidget.tsx
  /acuity
    AcuityMeter.tsx
    CensusInput.tsx
    StaffingRecommendation.tsx
  /notifications
    NotificationBell.tsx
    NotificationFeed.tsx
  /reports
    ReportBuilder.tsx
    ChartPanel.tsx
/lib
  /supabase
    client.ts
    server.ts
    middleware.ts
  /hooks
    useStaff.ts
    useSchedule.ts
    useTimeEntries.ts
    useCredentials.ts
    useNotifications.ts
    useRealtimeShifts.ts
  /utils
    date.ts
    scheduling.ts
    compliance.ts
    payroll.ts
  /types
    index.ts
/api                         ← Next.js API routes
  /schedule/route.ts
  /time-entries/route.ts
  /notifications/route.ts
  /payroll-export/route.ts
```

---

## 5. FEATURE IMPLEMENTATION DETAILS

---

### FEATURE 1: Staff Scheduling & Calendar Management

**Files:** `/app/(dashboard)/schedule/`, `/components/schedule/`

**Requirements:**
- Full calendar view (month/week/day) using `react-big-calendar` or `FullCalendar`
- Drag-and-drop shift assignment — drag staff from sidebar onto calendar slots
- Shift creation modal: date, time, staff member, department, role, notes
- Bulk schedule generation: copy previous week's schedule
- Schedule status workflow: Draft → Published → Archived
- Color-code shifts by department, role, or shift type
- Filter calendar by department, facility, role, staff member
- Conflict detection: highlight overlapping shifts, understaffed days
- "Skeleton Schedule" templates: save and reuse patterns

**Supabase queries:**
```typescript
// Fetch shifts for date range
const { data } = await supabase
  .from('shifts')
  .select(`*, staff(first_name, last_name, role, avatar_url), department(name, color)`)
  .gte('shift_date', startDate)
  .lte('shift_date', endDate)
  .eq('department_id', departmentId)
```

**UI Components:**
- `<ScheduleCalendar />` — main calendar with drag-and-drop
- `<ShiftModal />` — create/edit shift form
- `<StaffSidebar />` — draggable staff cards for assignment
- `<SchedulePublishModal />` — confirm publish with validation summary
- `<ConflictWarningBanner />` — list ratio violations before publishing

---

### FEATURE 2: Shift Swapping & Coverage

**Files:** `/app/(dashboard)/shifts/swaps/`, `/app/(staff-portal)/swaps/`

**Requirements:**
- Staff can request to swap a shift with a specific colleague OR post to open swap board
- Swap workflow: Staff requests → Target staff approves → Manager approves
- Manager can see all pending swaps with one-click approve/reject
- Automatic eligibility check: verify the swapping staff has correct role/skills
- Notifications at each approval step via Supabase Realtime
- Open Coverage Board: staff can pick up open shifts

**Supabase Realtime subscription:**
```typescript
const channel = supabase
  .channel('swap-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'shift_swaps',
    filter: `requested_staff_id=eq.${staffId}`
  }, handleSwapUpdate)
  .subscribe()
```

**UI Components:**
- `<SwapRequestCard />` — shows both shifts side by side for comparison
- `<SwapApprovalQueue />` — manager queue with bulk actions
- `<OpenCoverageBoard />` — board of open shifts staff can claim

---

### FEATURE 3: Time & Attendance Tracking

**Files:** `/app/(staff-portal)/clock/`, `/app/(dashboard)/time-attendance/`

**Requirements:**
- **Clock In/Out:** Big tap-to-clock button on mobile, geolocation capture, IP logging
- **Break Tracking:** Start/end meal and rest breaks
- **Timesheet View:** Weekly grid showing all entries per staff member
- **Manager Approval:** Review, edit, and approve timesheets before payroll
- **Overtime Calculator:** Flag entries >8h/day or >40h/week automatically
- **Edit History:** Full audit trail when manager edits a time entry
- **Geofence Validation:** Optional alert if clock-in location is outside facility

**Clock in implementation:**
```typescript
async function clockIn(staffId: string, shiftId: string) {
  const position = await getCurrentPosition()
  const { data } = await supabase.from('time_entries').insert({
    staff_id: staffId,
    shift_id: shiftId,
    clock_in: new Date().toISOString(),
    location: { lat: position.lat, lng: position.lng },
    ip_address: await getClientIP()
  })
}
```

**UI Components:**
- `<TimeClock />` — large clock-in button with current time display
- `<ActiveShiftBanner />` — shows elapsed time during active shift
- `<BreakTimer />` — running break timer with stop button
- `<TimesheetGrid />` — spreadsheet-style weekly timesheet
- `<OvertimeAlertBadge />` — flags overtime entries in red

---

### FEATURE 4: Staff Directory & Profiles

**Files:** `/app/(dashboard)/staff/`

**Requirements:**
- Searchable, filterable directory with avatar, name, role, department, status
- Staff profile page: personal info, employment details, skills, credentials, schedule history
- Availability grid: visual weekly availability per staff member
- Quick contact: click to email or call from directory
- Export directory to CSV
- Bulk import staff via CSV upload

**UI Components:**
- `<StaffDirectory />` — card grid with search/filter bar
- `<StaffProfileHeader />` — avatar, name, role, contact info, quick actions
- `<AvailabilityGrid />` — 7-day × shift-period grid with color blocks
- `<StaffStatsPanel />` — hours worked, overtime, attendance rate KPIs
- `<StaffImportModal />` — CSV drag-and-drop with column mapping

---

### FEATURE 5: Department & Unit Management

**Files:** `/app/(dashboard)/settings/departments/`

**Requirements:**
- Tree view of Organization → Facilities → Departments → Units
- Create, edit, archive departments
- Assign department heads/managers
- Set department capacity and bed counts
- Department-level staffing settings (color, code, shift templates)

**UI Components:**
- `<DepartmentTree />` — collapsible tree structure
- `<DepartmentForm />` — create/edit form with hierarchy picker
- `<DepartmentManagerAssignment />` — search and assign managers

---

### FEATURE 6: Credential & License Tracking

**Files:** `/app/(dashboard)/credentials/`, `/app/(dashboard)/staff/[id]/credentials/`

**Requirements:**
- Per-staff credential list with status badges: Active, Expiring Soon, Expired
- Upload credential documents to Supabase Storage
- Automated expiry alerts: 90/60/30/7 days before expiration
- Manager dashboard: compliance percentage per department
- Bulk view: which staff are missing required credentials
- Credential verification workflow: pending → verified by admin

**Expiry alert logic (Edge Function - daily cron):**
```typescript
// supabase/functions/credential-expiry-alerts/index.ts
const { data: expiring } = await supabase
  .from('staff_credentials')
  .select('*, staff(first_name, email), credential_types(name, alert_days_before)')
  .eq('status', 'active')
  .lte('expiry_date', addDays(new Date(), 90))
  .gte('expiry_date', new Date())

for (const cred of expiring) {
  await sendNotification({
    user_id: cred.staff.user_id,
    type: 'credential_expiring',
    title: `${cred.credential_types.name} expires soon`,
    body: `Expires on ${formatDate(cred.expiry_date)}`
  })
}
```

**UI Components:**
- `<CredentialDashboard />` — compliance score ring + expiry timeline
- `<CredentialCard />` — document preview, status badge, expiry countdown
- `<CredentialUploadForm />` — drag-and-drop with Supabase Storage upload
- `<CredentialAlertTable />` — sortable table of all expiring credentials
- `<MissingCredentialMatrix />` — staff × required credentials grid

---

### FEATURE 7: Staffing Ratios & Compliance

**Files:** `/app/(dashboard)/compliance/ratios/`

**Requirements:**
- Define minimum staffing ratios per department, shift type, and role (e.g., 1 RN : 4 patients ICU)
- Real-time ratio validation when building schedules
- Compliance score: % of shifts meeting ratio requirements
- Regulatory reference fields (California AB 394, CMS, JCAHO)
- Alerts when published schedule has ratio violations
- Historical compliance trend chart

**Ratio check function:**
```typescript
function checkStaffingRatio(
  scheduledStaff: Staff[],
  patientCount: number,
  ratioConfig: StaffingRatio[]
): ComplianceResult {
  return ratioConfig.map(ratio => ({
    role: ratio.role,
    required: Math.ceil(patientCount / ratio.max_patients),
    actual: scheduledStaff.filter(s => s.role === ratio.role).length,
    isCompliant: scheduledStaff.filter(s => s.role === ratio.role).length >= 
                 Math.ceil(patientCount / ratio.max_patients)
  }))
}
```

**UI Components:**
- `<RatioComplianceWidget />` — green/red gauge per unit
- `<RatioConfigForm />` — set ratios with reference law field
- `<ComplianceCalendar />` — heatmap of compliant vs non-compliant days
- `<RatioViolationAlert />` — inline warning in schedule builder

---

### FEATURE 8: Mobile Staff App (PWA)

**Files:** `/app/(staff-portal)/`

**Requirements:**
- Mobile-first responsive design, installable as PWA
- Bottom tab navigation: Schedule | Clock | Time Off | Notifications | Profile
- Push notifications via Web Push API + Supabase Edge Functions
- Offline support for viewing schedule (service worker cache)
- Biometric clock-in (Web Authentication API where supported)

**PWA config in `next.config.js`:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [/* cache schedule data */]
})
```

**UI Components:**
- `<MobileBottomNav />` — tab bar with badge counts
- `<MyScheduleView />` — scrollable week view optimized for mobile
- `<ClockInButton />` — large tap target with geolocation
- `<NotificationFeed />` — chronological notification list

---

### FEATURE 9: Manager Dashboard

**Files:** `/app/(dashboard)/page.tsx`

**Requirements:**
- Real-time staffing overview: current shift coverage by unit
- KPI cards: Today's headcount, open shifts, overtime hours, credential alerts
- Labor cost tracker: actual vs budgeted for the pay period
- Staffing ratio compliance score (% of units compliant right now)
- Upcoming credential expirations widget
- Recent activity feed (shift changes, time-off requests, swap approvals)
- Quick actions: Post open shift, Approve pending requests

**UI Components:**
- `<StaffingOverviewMap />` — unit grid showing green/yellow/red staffing status
- `<KPICardRow />` — 4–6 animated metric cards
- `<LaborCostChart />` — actual vs budget line chart (Recharts)
- `<PendingActionsPanel />` — inbox of items needing manager action
- `<ActivityFeed />` — real-time log of workforce events

---

### FEATURE 10: Time-Off Request Management

**Files:** `/app/(staff-portal)/time-off/`, `/app/(dashboard)/time-attendance/time-off/`

**Requirements:**
- Staff submit time-off requests with type, date range, and reason
- Manager sees calendar view of all approved time off per department
- Approval workflow with optional notes
- PTO balance display (current hours by type)
- Conflict check: alert manager if approving leaves department understaffed
- Automatic PTO accrual calculation (configurable per org)
- FMLA tracking with protected leave flags

**UI Components:**
- `<TimeOffRequestForm />` — date range picker, type selector, PTO balance display
- `<TimeOffCalendar />` — department calendar showing approved absences
- `<TimeOffApprovalQueue />` — manager queue with conflict warnings
- `<PTOBalanceCard />` — hours available per leave type

---

### FEATURE 11: Payroll Integration

**Files:** `/app/(dashboard)/settings/payroll/`, `/api/payroll-export/`

**Requirements:**
- Export time entries to CSV/Excel compatible with major payroll systems (ADP, Paychex, Kronos)
- Pay code mapping: regular, overtime, holiday, on-call, differential
- Two-week/bi-weekly pay period configuration
- Approval lock: once approved, entries cannot be edited without audit log entry
- Export preview: see all entries before exporting
- Integration webhook support for direct API push to payroll systems

**Export function:**
```typescript
// api/payroll-export/route.ts
export async function POST(req: Request) {
  const { period_start, period_end, department_id } = await req.json()
  
  const { data: entries } = await supabase
    .from('time_entries')
    .select(`*, staff(employee_id, first_name, last_name, department_id), shifts(shift_type)`)
    .gte('clock_in', period_start)
    .lte('clock_out', period_end)
    .eq('status', 'completed')

  const csv = generatePayrollCSV(entries, payCodeMapping)
  // store in Supabase Storage and return download URL
}
```

**UI Components:**
- `<PayrollExportWizard />` — multi-step: select period → preview → export
- `<PayCodeMappingTable />` — admin config for pay codes
- `<ExportHistoryLog />` — past exports with download links

---

### FEATURE 12: Overtime Management

**Files:** `/app/(dashboard)/time-attendance/`

**Requirements:**
- Automatic overtime detection: >8h/day, >40h/week, >12h shift
- OT cost dashboard: real-time running total vs budget
- Pre-shift overtime warnings: alert manager before scheduling staff into OT
- Overtime approval workflow: require manager approval before allowing OT
- OT trend charts by department and pay period

**UI Components:**
- `<OvertimeCostMeter />` — gauge showing OT budget utilization
- `<OvertimeApprovalModal />` — confirm OT authorization with reason
- `<OvertimeTrendChart />` — weekly OT hours by department (bar chart)
- `<PreShiftOTWarning />` — inline banner in schedule builder

---

### FEATURE 13: Float Pool Management

**Files:** `/app/(dashboard)/float-pool/`

**Requirements:**
- Float pool roster: staff flagged as float-eligible with skill profiles
- Smart matching: suggest float staff based on skills, availability, and proximity
- Cross-unit assignment workflow: request, confirm, and track float assignments
- Float history per staff member
- Float incentive tracking (bonus pay for floating)

**UI Components:**
- `<FloatPoolRoster />` — list of float-eligible staff with availability
- `<FloatMatchSuggestions />` — ranked list of eligible staff for an open need
- `<FloatAssignmentForm />` — from/to department, date, skill match confirmation
- `<FloatHistoryTimeline />` — per-staff floating record

---

### FEATURE 14: Per Diem & Contract Staff

**Files:** `/app/(dashboard)/staff/` (filtered by employment_type)

**Requirements:**
- Separate contract/agency staff profiles with agency name, bill rate, pay rate
- Contract date tracking with expiration alerts
- Scheduling constraints: contract staff only visible in scheduling for their contract period
- Agency contact directory
- Cost comparison: internal staff vs agency staff per shift

**UI Components:**
- `<ContractStaffBadge />` — visual indicator on staff cards
- `<ContractDetailsPanel />` — agency info, rates, contract dates
- `<AgencyRateComparison />` — internal vs external cost per shift chart

---

### FEATURE 15: Acuity-Based Staffing

**Files:** `/app/(dashboard)/acuity/`

**Requirements:**
- Charge nurses input patient census and acuity scores per shift
- System calculates recommended staffing based on acuity configuration
- Compare actual scheduled staff vs acuity-recommended staff
- Trend charts: census and acuity over time
- Alert when scheduled staffing is insufficient for current acuity level

**Acuity calculation:**
```typescript
function getStaffingRecommendation(
  census: number,
  acuityScore: number,
  plans: AcuityStaffingPlan[]
): StaffingRecommendation {
  const plan = plans.find(p => 
    acuityScore >= p.acuity_score_min && acuityScore <= p.acuity_score_max
  )
  return {
    rn: Math.ceil((census / plan.recommended_rn)),
    lpn: Math.ceil((census / plan.recommended_lpn)),
    cna: Math.ceil((census / plan.recommended_cna)),
  }
}
```

**UI Components:**
- `<CensusInputForm />` — charge nurse quick-entry form per unit
- `<AcuityGauge />` — visual acuity level indicator (low/moderate/high/critical)
- `<StaffingRecommendationCard />` — recommended vs actual comparison
- `<CensusTrendChart />` — 7/14/30 day census and acuity trend

---

### FEATURE 16: Shift Handoff Communication

**Files:** `/app/(dashboard)/shifts/`, staff portal shift detail

**Requirements:**
- End-of-shift note entry for outgoing staff
- Incoming staff must acknowledge handoff notes
- Priority flags: Routine, Important, Urgent
- Department-wide handoff board (all active notes for the unit)
- Handoff notes automatically archived after 24 hours

**UI Components:**
- `<HandoffNoteForm />` — rich text entry with priority selector
- `<HandoffBoard />` — unit-level board of active handoff notes
- `<AcknowledgeButton />` — tap to mark as read with timestamp
- `<HandoffHistoryDrawer />` — past handoff notes searchable by date

---

### FEATURE 17: Skills Matrix & Competency Tracking

**Files:** `/app/(dashboard)/staff/[id]/skills/`

**Requirements:**
- Visual matrix: staff (rows) × skills (columns) with proficiency color coding
- Skill proficiency levels: Novice, Competent, Proficient, Expert
- Assessment scheduling with due date alerts
- Skill gap analysis: required skills for a department vs current staff competencies
- Export skills matrix to PDF/Excel

**UI Components:**
- `<SkillsMatrixTable />` — scrollable grid with color-coded cells
- `<SkillAssessmentForm />` — record assessment result with assessor and date
- `<SkillGapAnalysis />` — bar chart showing coverage gaps
- `<ProficiencyBadge />` — colored badge for each level

---

### FEATURE 18: Budget Planning & Forecasting

**Files:** `/app/(dashboard)/budget/`

**Requirements:**
- Annual/quarterly/monthly budget creation per department
- Track actual hours and costs vs budget in real time
- Labor cost forecasting based on scheduled shifts + historical actuals
- Variance analysis with drill-down by role, shift type, OT vs regular
- What-if scenarios: model impact of adding/removing FTEs
- Export budget reports to Excel

**UI Components:**
- `<BudgetOverviewCards />` — budgeted vs actual for current period
- `<BudgetVsActualChart />` — line chart over time (Recharts)
- `<VarianceTable />` — department breakdown with drill-down
- `<ForecastingWizard />` — inputs for scenario modeling
- `<BudgetAllocationEditor />` — spreadsheet-style budget entry

---

### FEATURE 19: Union Contract Compliance

**Files:** `/app/(dashboard)/compliance/union/`

**Requirements:**
- Store union contract rules as structured JSON (min rest between shifts, max consecutive days, premium pay triggers)
- Automated rule validation when building schedules
- Violations flagged with contract article reference
- Union grievance tracking (optional)
- Contract renewal alerts

**Union rule types to implement:**
```typescript
type UnionRule = {
  type: 'min_rest_hours' | 'max_consecutive_days' | 'weekend_frequency' | 
        'holiday_premium' | 'mandatory_overtime_consent' | 'seniority_scheduling'
  value: number | string
  article_reference: string
  applies_to_roles: string[]
}
```

**UI Components:**
- `<UnionRuleList />` — list of active rules with article references
- `<ContractViolationAlert />` — inline warning in schedule builder
- `<UnionContractUploader />` — upload PDF + enter structured rules
- `<ComplianceAuditLog />` — log of all detected violations

---

### FEATURE 20: Reporting & Analytics

**Files:** `/app/(dashboard)/reports/`

**Requirements:**
- Pre-built reports:
  - Staffing Hours by Department (period)
  - Overtime Cost Report
  - Credential Compliance Report
  - Time-Off Usage Report
  - Turnover & Retention Report
  - Agency vs Internal Cost Comparison
  - Shift Fill Rate by Unit
- Custom report builder: select metrics, dimensions, date range, filters
- Chart types: bar, line, pie, heatmap
- Export to CSV, PDF, Excel
- Schedule automated report delivery via email

**UI Components:**
- `<ReportLibrary />` — card grid of available reports with preview
- `<ReportBuilder />` — drag-and-drop metric/dimension selector
- `<ChartPanel />` — renders selected chart type with Recharts
- `<ExportToolbar />` — CSV / PDF / Excel buttons
- `<ScheduledReportConfig />` — frequency and email recipient settings

---

### FEATURE 21: Emergency Response Staffing

**Files:** `/app/(dashboard)/emergency/`

**Requirements:**
- Declare emergency event with type and description
- Broadcast push notification to all off-duty staff in eligible roles
- Real-time response board: who's available, on the way, arrived
- Emergency schedule view: quickly assign responding staff to emergency shifts
- Incident log with timeline of responses
- Post-incident debrief report

**Emergency broadcast flow:**
```typescript
// When emergency declared, trigger Edge Function
async function broadcastEmergency(event: EmergencyEvent) {
  const { data: eligibleStaff } = await supabase
    .from('staff')
    .select('user_id, role, facility_id')
    .eq('facility_id', event.facility_id)
    .eq('is_active', true)

  // Insert notifications for all eligible staff
  await supabase.from('notifications').insert(
    eligibleStaff.map(s => ({
      user_id: s.user_id,
      type: 'emergency',
      title: `⚠️ Emergency: ${event.title}`,
      body: event.description,
      data: { event_id: event.id }
    }))
  )
}
```

**UI Components:**
- `<EmergencyDeclareModal />` — event type, description, affected units
- `<ResponseBoard />` — real-time grid of staff responses (Realtime subscription)
- `<EmergencyScheduler />` — rapid shift assignment UI
- `<IncidentTimeline />` — chronological log of events and responses

---

### FEATURE 22: Multi-Facility Management

**Files:** `/app/(dashboard)/settings/facilities/`, facility switcher in nav

**Requirements:**
- Global facility switcher in top navigation
- Facility-scoped data: all queries filter by selected facility
- Cross-facility staffing: view and request staff from other facilities
- Consolidated reporting across all facilities (Executive view)
- Per-facility settings: timezone, policies, shift templates

**Facility context implementation:**
```typescript
// lib/hooks/useFacility.ts
export const useFacilityStore = create<FacilityState>((set) => ({
  currentFacility: null,
  setFacility: (facility) => set({ currentFacility: facility }),
}))

// Apply to all Supabase queries:
const facilityId = useFacilityStore(s => s.currentFacility?.id)
const { data } = await supabase
  .from('shifts')
  .select('*')
  .eq('facility_id', facilityId)
```

**UI Components:**
- `<FacilitySwitcher />` — dropdown in top nav with facility list
- `<FacilityOverviewGrid />` — all facilities' staffing status side by side
- `<CrossFacilityReport />` — consolidated metrics with facility breakdown

---

## 6. AUTHENTICATION & AUTHORIZATION

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

// Role-based route protection
// /dashboard/* → requires role: manager | director | admin | executive
// /staff-portal/* → requires role: staff | charge_nurse | manager
```

**Auth flows to implement:**
- Email/password login
- Magic link login (for staff with limited tech access)
- Role assignment on first login (admin configures)
- Password reset
- Session management with Supabase Auth Helpers

---

## 7. REAL-TIME FEATURES

Use Supabase Realtime for live updates across all connected clients:

```typescript
// Example: Live staffing status on manager dashboard
useEffect(() => {
  const channel = supabase
    .channel('live-staffing')
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'time_entries',
      filter: `facility_id=eq.${facilityId}`
    }, () => refetchStaffingStatus())
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'shifts',
      filter: `shift_date=eq.${today}`
    }, () => refetchTodayShifts())
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [facilityId])
```

Real-time tables: `shifts`, `time_entries`, `notifications`, `emergency_events`, `emergency_responses`, `handoff_notes`, `shift_swaps`, `open_shifts`

---

## 8. ENVIRONMENT VARIABLES

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

---

## 9. PACKAGE DEPENDENCIES

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@fullcalendar/react": "^6.0.0",
    "@fullcalendar/daygrid": "^6.0.0",
    "@fullcalendar/timegrid": "^6.0.0",
    "@fullcalendar/interaction": "^6.0.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^7.0.0",
    "recharts": "^2.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zustand": "^4.0.0",
    "@tanstack/react-query": "^5.0.0",
    "date-fns": "^3.0.0",
    "react-datepicker": "^6.0.0",
    "next-pwa": "^5.6.0",
    "web-push": "^3.6.0",
    "papaparse": "^5.4.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0"
  }
}
```

---

## 10. IMPLEMENTATION ORDER (RECOMMENDED)

Build in this sequence for a logical dependency chain:

1. **Foundation** — Supabase schema, auth, middleware, layout, navigation
2. **Staff Module** — staff table, profiles, directory, department management
3. **Scheduling Core** — shift templates, calendar view, basic shift CRUD
4. **Time & Attendance** — time clock, timesheet, time-off requests
5. **Credentials** — credential types, tracking, expiry alerts
6. **Shift Operations** — swaps, open shifts, float pool
7. **Compliance** — staffing ratios, union rules, compliance dashboard
8. **Acuity** — census input, acuity-based staffing recommendations
9. **Budget & Payroll** — budget plans, payroll export
10. **Analytics** — reports, charts, executive dashboard
11. **Emergency** — emergency events, broadcast, response tracking
12. **Mobile PWA** — staff portal, push notifications, offline support
13. **Multi-Facility** — facility switcher, cross-facility views

---

## 11. KEY DESIGN DECISIONS

- **All timestamps in UTC** in the database; convert to local timezone on display using `date-fns-tz` and the facility's configured timezone
- **Soft deletes** — use `is_active = false` instead of deleting staff records to preserve scheduling history
- **Optimistic updates** — use React Query's `optimisticUpdate` for drag-and-drop scheduling to feel instant
- **Server Components** — use Next.js Server Components for initial data fetch on report and dashboard pages; use Client Components only where interactivity is required
- **JSONB fields** — use `settings`, `rules`, `availability`, and `metadata` JSONB columns for flexible configuration without schema migrations
- **Audit trail** — for any mutation on `shifts`, `time_entries`, or `credentials`, write to an `audit_log` table with old/new values and actor

---

*End of prompt. This document fully specifies every feature, database table, component, and integration needed to build the Healthcare Workforce Intelligence Platform with Next.js and Supabase.*
