# EduSmart Pro Comprehensive Architecture Context

## System Architecture
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4.
- **Database / Backend**: Supabase (PostgreSQL + PostgREST + Realtime WebSocket) + Firebase Admin (FCM push notifications).
- **Core Entities**:
  - `institutions`: School / coaching institute tenant.
  - `admins`: Institution administrators and staff credentials.
  - `branches`: Multiple branch locations under an institution.
  - `batches`: Class groupings, timings, timetable slots, assignments.
  - `students`: Enrolled students, linked via `batch_students`.
  - `attendance`: Daily presence tracking per student per batch (`present`, `absent`, `late`, `leave`).
  - `fee_records`: Monthly fee status per student (`paid`, `pending`, `partial`, `unpaid`).
  - `notifications` & `notices`: Direct student inbox alerts and institution-wide broadcasts.

## Known Critical Issues & Vulnerabilities
1. **Realtime Attendance Desync**:
   - `recordAttendance` & `recordBulkAttendance` did not provide `onConflict: "institution_id,batch_id,student_id,date"`. Toggling attendance or inserting records threw PostgreSQL unique constraint errors.
   - Channel topic naming collision (`batches_realtime_${institutionCode}` shared by multiple mounted components and pages) caused channels to be torn down unexpectedly.
   - Student dashboard listened to entire institution batches, triggering 7-table joined queries on every single click in the school.
   - Missing `REPLICA IDENTITY FULL` on `attendance` table caused PostgreSQL replication WAL to drop column filters on UPDATE events.
2. **Security Vulnerabilities**:
   - `students` table queries selected `*`, leaking sensitive password hashes/telephones over network.
   - Missing Next.js HTTP security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy).
   - RLS open policies on mutation tables without row validation.
3. **App Slowness & Performance Bottlenecks**:
   - Excessive re-fetching of all batches and students on attendance clicks.
   - High GPU raymarching iterations in `GradientWaves.jsx` without reduced-motion / battery-saving thresholds.
   - Heavy render re-computations without targeted listeners.
4. **SEO / AEO / GEO**:
   - Malformed birthDate in JSON-LD (`XXXX-09-07`).
   - Private dashboard pages in `sitemap.ts` conflicting with `robots.txt`.
   - Missing rich Schema.org search action, breadcrumbs, and natural answer engine citation graph.
5. **AI Appearance / Copy Polish**:
   - Generic robotic phrases replaced with authentic, professional human copywriting tailored for Indian coaching centers and schools.
