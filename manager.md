# Manager Role

## Overview

Managers supervise healthcare staff within their department or unit.

They are responsible for **staff scheduling, shift management, and leave approvals**.

Managers have **department-level permissions**, but not full system control.

---

## Manager–Staff Connection

Managers and staff are linked by **department**. Both have a `department_id` on their profile:

* **Manager**: User with role `manager` and a `department_id` (the department they manage).
* **Staff**: User with role `staff` and a `department_id` (the department they belong to).

A manager **only sees and approves** requests for staff in the **same department** as their own `department_id`. There is no separate "reports to" or "manager_id" field — the relationship is **same department**. Admins can approve across all departments.

---

# Manager Dashboard

The Manager dashboard shows **department workforce metrics**.

### Widgets

* Department Staff Count
* Open Shifts
* Pending Time-Off Requests
* Shift Coverage
* Overtime Summary

---

# Staff Directory (Department)

Managers can view staff within their department.

### Features

* View staff profiles
* View skills and credentials
* View availability
* Contact staff

Managers cannot create or delete staff accounts.

---

# Scheduling Management

Managers manage shift schedules for their department.

### Features

* Create shift schedules
* Assign staff to shifts
* Update shifts
* Monitor open shifts

### Shift Data

* Shift date
* Start time
* End time
* Assigned staff
* Department
* Unit

---

# Shift Swap Approval

Managers review swap requests between staff.

### Workflow

1. Staff requests shift swap
2. Another staff member accepts
3. Manager approves swap

### Status

* Pending
* Approved
* Rejected

---

# Time Tracking Oversight

Managers can view attendance records.

### Features

* View staff clock-in/out
* Monitor overtime
* Review time entries

Managers cannot edit clock-in records.

---

# Time Off Approvals

Managers review leave requests.

### Features

* Approve requests
* Reject requests
* View leave calendar

---

# Credential Monitoring

Managers can monitor certifications.

### Features

* View staff credentials
* Track expiring licenses
* Ensure compliance

Managers cannot edit credentials.

---

# Department Reports

Managers can access **department-level reports**.

### Reports

* Staff utilization
* Overtime analysis
* Shift coverage
* Workforce availability

---

# Restrictions

Managers cannot:

* Manage system settings
* Create departments
* Manage user roles
* Access system-wide analytics

---

# Sidebar Navigation (Manager)

Dashboard
Team Staff
Schedules
Time Tracking
Time Off Approvals
Credentials
Reports
Notifications
