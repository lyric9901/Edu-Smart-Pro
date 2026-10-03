-- EduSmartPro RLS Hardening Migration
-- Migration: 20261003000001_harden_rls.sql
-- Remediates SEC-001: Locks down public access to credentials and institutional management

-- 1. ADMINTABLE HARDENING
-- Drop open policy on admins
drop policy if exists "Allow all on admins" on public.admins;
drop policy if exists "Service role only on admins" on public.admins;

-- Ensure RLS is active
alter table public.admins enable row level security;

-- Only service_role (backend server endpoints) can read or modify the admins table.
-- Anon and authenticated client roles have zero direct access via PostgREST.
create policy "Service role only on admins"
  on public.admins
  for all
  to service_role
  using (true)
  with check (true);

-- 2. INSTITUTIONS TABLE HARDENING
-- Drop open policy on institutions
drop policy if exists "Allow all on institutions" on public.institutions;
drop policy if exists "Allow read access on institutions" on public.institutions;
drop policy if exists "Service role write access on institutions" on public.institutions;

-- Ensure RLS is active
alter table public.institutions enable row level security;

-- Read access is permitted for institution validation (e.g., student/admin login lookup)
create policy "Allow read access on institutions"
  on public.institutions
  for select
  using (true);

-- Mutations (insert, update, delete) are strictly reserved for service_role (server endpoints)
create policy "Service role write access on institutions"
  on public.institutions
  for all
  to service_role
  using (true)
  with check (true);
