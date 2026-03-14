# 🏥 Healthcare Workforce Management Platform

> A comprehensive system designed to help healthcare organizations manage staff scheduling, workforce operations, compliance, and workforce analytics.

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## 📑 Table of Contents
- [Overview](#-overview)
- [System Roles](#-system-roles)
- [Core Modules](#-core-modules)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Database Entities](#-database-entities)
- [Security](#-security)
- [MVP Scope](#-mvp-scope)
- [Future Enhancements](#-future-enhancements)

---

## 🌟 Overview

The Healthcare Workforce Management Platform enables hospitals and healthcare facilities to:
- 👥 **Manage healthcare staff** (profiles, skills, unit assignments)
- 📅 **Schedule shifts efficiently** and handle swaps
- ⏱️ **Track attendance** and working hours
- 📜 **Ensure credential compliance** (licenses, certifications)
- 🏖️ **Manage time-off requests** 
- 📊 **Monitor workforce analytics** (overtime, ratios, coverage)
- ⚖️ **Maintain staffing ratios** and operational efficiency

The platform supports secure **Role-Based Access Control (RBAC)** ensuring data privacy and correct administrative privileges.

---

## 🔐 System Roles

The system is built around three primary roles, each restricted to their respective dashboards and capabilities.

### 1️⃣ Admin (`/dashboard/admin`)
Admin users have **full system control** and oversee the organization.
- **Responsibilities:** Manage users/staff, configure departments and units, monitor workforce analytics, manage compliance policies, and configure system settings.
- **Key Features:** System-wide reports, credential requirement management, staffing ratio monitoring.

### 2️⃣ Manager (`/dashboard/manager`)
Managers oversee **staff operations within their department or unit**.
- **Responsibilities:** Manage schedules, assign shifts, monitor attendance, approve time-off/swap requests, and ensure staffing coverage.
- **Key Features:** Department analytics, overtime tracking, staff directory overview.

### 3️⃣ Staff (`/dashboard/staff`)
Staff users include **nurses, doctors, technicians, and healthcare workers**.
- **Responsibilities:** View personal schedules, track work hours, submit requests (swaps, PTO).
- **Key Features:** Clock in/out, view upcoming shifts, upload credentials, update availability.

---

## 🧩 Core Modules

### 🛡️ Authentication & Authorization
- Email/password login via **Supabase Auth**
- Automatic dashboard redirection based on RBAC
- Secure session management and route protection

### 👩‍⚕️ Staff Management
- Comprehensive staff directory with search/filters
- Profile management (Personal, Professional, Credentials, Availability)
- Skills and credential tracking

### 🏥 Department & Unit Management
- Create/manage departments (e.g., Emergency, ICU, Surgery, Pediatrics)
- Assign staff to departments and hospital units
- Manage organizational hierarchy

### 🗓️ Shift Scheduling & Swaps
- Calendar view for creating/assigning shifts
- Real-time schedule updates and open shift tracking
- **Shift Swap Workflow:** Request $\rightarrow$ Peer Accept $\rightarrow$ Manager Approval

### ⏱️ Time Tracking & Time-Off
- Clock-in / Clock-out functionality
- Break tracking and Overtime calculations
- PTO and Sick Leave request workflows (Pending $\rightarrow$ Approved/Rejected)

### 📜 Credential & License Tracking
- Document uploads for Nursing Licenses, CPR Certifications, etc.
- Expiration tracking with automated alerts

### 🔔 Notification System
- In-app and toast alerts for schedule updates, swap approvals, PTO status, and credential expirations.

### 📊 Dashboards & Analytics
- **Admin Dashboard:** Total staff, org-wide metrics, utilization, compliance.
- **Manager Dashboard:** Department metrics, open shifts, pending approvals.
- **Staff Dashboard:** Upcoming shifts, work hours limit tracking, personal requests.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Forms & Validation:** React Hook Form + [Zod](https://zod.dev/)
- **Notifications:** Sonner Toast

### Backend
- **Database:** PostgreSQL (via [Supabase](https://supabase.com/))
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for credentials and documents)

---

## 🗄️ Database Entities

- Users
- Staff
- Departments
- Units
- Skills
- Credentials
- Staff Skills
- Staff Credentials
- Availability
- Shifts
- Shift Assignments
- Time Entries
- Time-Off Requests
- Shift Swap Requests
- Notifications

---

## 🔒 Security

We enforce strict **Role-Based Access Control (RBAC)** combined with **Row Level Security (RLS)** in Supabase to guarantee that:
- **Admins** have full data access.
- **Managers** can only access and mutate data within their assigned departments.
- **Staff** can only access and modify their personal records, schedules, and requests.

---

## 🚀 MVP Scope

The Initial release focuses on core operations:
- Authentication & RBAC
- Staff & Department Management
- Shift Scheduling
- Time Tracking
- Shift Swap & Time-off Requests
- Manager Dashboard

---

## 🔮 Future Enhancements

- 🤖 **AI Shift Scheduling & Recommendations:** Automated roster generation.
- 📈 **Predictive Staffing:** Forecasting patient volume against required staff.
- ❤️ **Staff Burnout Analytics:** Identifying overworked employees.
- 📱 **Mobile Workforce App:** Dedicated native app for on-the-go access.

---

*This platform aims to provide a reliable, efficient, and user-friendly experience, ensuring healthcare facilities have the right staff at the right time while maintaining absolute compliance.*
