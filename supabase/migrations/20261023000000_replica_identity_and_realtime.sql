-- EduSmartPro Supabase Realtime & Replication Hardening Migration
-- Migration: 20261023000000_replica_identity_and_realtime.sql
-- Enables REPLICA IDENTITY FULL so Postgres WAL outputs all row fields on UPDATE/DELETE,
-- allowing Supabase Realtime client filters (e.g. student_id=eq..., institution_id=eq...) to fire immediately.

alter table if exists public.attendance replica identity full;
alter table if exists public.fee_records replica identity full;
alter table if exists public.students replica identity full;
alter table if exists public.batches replica identity full;
alter table if exists public.batch_students replica identity full;
alter table if exists public.assignments replica identity full;
alter table if exists public.timetable_slots replica identity full;
alter table if exists public.notices replica identity full;
alter table if exists public.notifications replica identity full;
alter table if exists public.users replica identity full;

-- Ensure supabase_realtime publication includes all relevant tables
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.attendance;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.fee_records;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.assignments;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.timetable_slots;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.notices;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.notifications;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.batches;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.students;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
