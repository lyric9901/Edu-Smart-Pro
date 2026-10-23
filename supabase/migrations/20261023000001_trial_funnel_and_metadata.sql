-- EduSmart Pro 7-Day Free Trial Funnel & Email Automation Schema Migration
-- Migration: 20261023000001_trial_funnel_and_metadata.sql

-- 1. Extend institutions table
alter table if exists public.institutions
  add column if not exists email text,
  add column if not exists institution_type text default 'Coaching',
  add column if not exists address text,
  add column if not exists category text,
  add column if not exists description text,
  add column if not exists trial_start_date timestamptz default now(),
  add column if not exists trial_end_date timestamptz default (now() + interval '7 days'),
  add column if not exists plan_status text default 'active',
  add column if not exists notified_day_4 boolean default false,
  add column if not exists notified_expired boolean default false;

-- Create unique index on institutions email (case-insensitive) where email is not null
create unique index if not exists idx_institutions_email_unique on public.institutions (lower(email)) where email is not null and email <> '';

-- 2. Extend admins table
alter table if exists public.admins
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists full_name text,
  add column if not exists age integer,
  add column if not exists force_password_reset boolean default false;

-- Create unique index on admins email (case-insensitive) where email is not null
create unique index if not exists idx_admins_email_unique on public.admins (lower(email)) where email is not null and email <> '';

-- 3. Add to realtime replication if applicable
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.institutions;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
