# Implementation Plan - Realtime Sync, Security Hardening, Performance & SEO/AEO/GEO

## Phase 1: Realtime Attendance & Data Synchronization (Fix Root Cause)
- [ ] 1.1: Fix `recordAttendance` and `recordBulkAttendance` in `src/lib/supabaseDb.ts` to specify `onConflict: "institution_id,batch_id,student_id,date"`.
- [ ] 1.2: Fix `updateFeeStatus` and `recordBulkFees` in `src/lib/supabaseDb.ts` to specify `onConflict: "institution_id,batch_id,student_id,year,month"`.
- [ ] 1.3: Fix `addMultipleStudentsToBatch` in `src/lib/supabaseDb.ts` with proper `onConflict: "institution_id,batch_id,student_id"`.
- [ ] 1.4: Implement dedicated `subscribeToStudentData(institutionCode, batchId, studentId, callbacks)` in `src/lib/supabaseDb.ts` with direct `attendance` channel listener (`student_id=eq.${studentId}`) and isolated unique channel names.
- [ ] 1.5: Update `src/app/student/page.tsx` to use `subscribeToStudentData` for instant zero-refresh attendance and homework/notice updates.
- [ ] 1.6: Add Supabase migration `20261023000000_replica_identity_and_realtime.sql` setting `REPLICA IDENTITY FULL` on `attendance`, `fee_records`, `students`, `notices`, `assignments`.

## Phase 2: Security Hardening & Vulnerability Remediation (OWASP / CodeRabbit Standard)
- [ ] 2.1: Strip `password` selection from client-side `getBatches` in `src/lib/supabaseDb.ts` (only query safe student fields: `id, name, phone, roll_number, performance`).
- [ ] 2.2: Add strict HTTP security headers in `next.config.mjs` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS).
- [ ] 2.3: Harden Supabase RLS migration policies to ensure student/teacher data integrity.
- [ ] 2.4: Validate all inputs in student/admin routes against injection and prototype pollution.

## Phase 3: Performance Optimization (Fix App Slowness)
- [ ] 3.1: Debounce batch updates and avoid multi-query cascade when teachers toggle attendance.
- [ ] 3.2: Optimize `src/components/GradientWaves.jsx` with mobile detection, lower raymarching steps, and reduced motion fallback.
- [ ] 3.3: Optimize Next.js compiler settings and package caching in `next.config.mjs`.

## Phase 4: SEO, AEO, GEO & Natural Human Craftsmanship (10/10)
- [ ] 4.1: Fix schema date syntax in `src/context/JsonLd.tsx` (`XXXX-09-07` -> valid format) and enrich Organization, FAQPage, BreadcrumbList, and SoftwareApplication schemas.
- [ ] 4.2: Clean `src/app/sitemap.ts` to only index public pages and eliminate conflicting `robots.txt` disallows.
- [ ] 4.3: Enhance `public/llms.txt` and meta tags for Generative Engine Optimization (ChatGPT, Perplexity, Gemini, Claude).
- [ ] 4.4: Remove robotic AI-like phrasing and elevate copy across student dashboard, homework, and pricing pages.

## Phase 5: Verification & Shipping
- [ ] 5.1: Build validation with `bun run build`.
- [ ] 5.2: Verification of realtime sync hooks and attendance state updates.
- [ ] 5.3: Update `PROGRESS.md` and report concise summary.
