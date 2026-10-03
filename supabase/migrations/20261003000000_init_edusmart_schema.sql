-- EduSmartPro Supabase PostgreSQL Relational Schema
-- Migration: 20261003000000_init_edusmart_schema.sql

create extension if not exists "pgcrypto";

-- 1. Institutions Table
create table if not exists public.institutions (
    id text primary key, -- e.g. "TOP8291"
    name text not null,
    owner text,
    phone text,
    plan text default 'premium',
    created_at timestamptz default now()
);

-- 2. Branches Table
create table if not exists public.branches (
    id text not null,
    institution_id text not null references public.institutions(id) on delete cascade,
    name text not null,
    created_at timestamptz default now(),
    primary key (institution_id, id)
);

-- 3. Admins / Institution Users Table
create table if not exists public.admins (
    id uuid default gen_random_uuid() primary key,
    username text not null unique,
    password text not null,
    institution_id text references public.institutions(id) on delete set null,
    branch_id text,
    role text default 'admin',
    created_at timestamptz default now()
);

alter table if exists public.admins alter column institution_id drop not null;


-- 4. Batches Table
create table if not exists public.batches (
    id text not null,
    institution_id text not null references public.institutions(id) on delete cascade,
    branch_id text,
    name text not null,
    timing_start text,
    timing_end text,
    created_at timestamptz default now(),
    primary key (institution_id, id)
);

-- 5. Teachers Table
create table if not exists public.teachers (
    id text not null,
    institution_id text not null references public.institutions(id) on delete cascade,
    name text not null,
    phone text,
    email text,
    subject text,
    created_at timestamptz default now(),
    primary key (institution_id, id)
);

-- 6. Students Table
create table if not exists public.students (
    id text not null,
    institution_id text not null references public.institutions(id) on delete cascade,
    name text not null,
    phone text,
    roll_number text,
    password text,
    performance numeric default 0,
    created_at timestamptz default now(),
    primary key (institution_id, id)
);

-- 7. Batch Students Junction Table
create table if not exists public.batch_students (
    id uuid default gen_random_uuid() primary key,
    institution_id text not null references public.institutions(id) on delete cascade,
    batch_id text not null,
    student_id text not null,
    created_at timestamptz default now(),
    unique (institution_id, batch_id, student_id),
    foreign key (institution_id, batch_id) references public.batches(institution_id, id) on delete cascade,
    foreign key (institution_id, student_id) references public.students(institution_id, id) on delete cascade
);

-- 8. Attendance Table
create table if not exists public.attendance (
    id uuid default gen_random_uuid() primary key,
    institution_id text not null references public.institutions(id) on delete cascade,
    batch_id text not null,
    student_id text not null,
    date text not null, -- YYYY-MM-DD format
    status text not null default 'present' check (status in ('present', 'absent', 'late', 'not-marked', 'leave')),
    created_at timestamptz default now(),
    unique (institution_id, batch_id, student_id, date),
    foreign key (institution_id, batch_id) references public.batches(institution_id, id) on delete cascade,
    foreign key (institution_id, student_id) references public.students(institution_id, id) on delete cascade
);

alter table if exists public.attendance drop constraint if exists attendance_status_check;
alter table if exists public.attendance add constraint attendance_status_check check (status in ('present', 'absent', 'late', 'not-marked', 'leave'));

-- 9. Fee Records Table
create table if not exists public.fee_records (
    id uuid default gen_random_uuid() primary key,
    institution_id text not null references public.institutions(id) on delete cascade,
    batch_id text not null,
    student_id text not null,
    year integer not null,
    month text not null,
    status text not null default 'pending' check (status in ('paid', 'pending', 'partial', 'unpaid')),
    amount numeric default 0,
    paid_at timestamptz,
    created_at timestamptz default now(),
    unique (institution_id, batch_id, student_id, year, month),
    foreign key (institution_id, batch_id) references public.batches(institution_id, id) on delete cascade,
    foreign key (institution_id, student_id) references public.students(institution_id, id) on delete cascade
);

alter table if exists public.fee_records drop constraint if exists fee_records_status_check;
alter table if exists public.fee_records add constraint fee_records_status_check check (status in ('paid', 'pending', 'partial', 'unpaid'));

-- 10. Exams & Exam Scores
create table if not exists public.exams (
    id text not null,
    institution_id text not null references public.institutions(id) on delete cascade,
    batch_id text not null,
    name text not null,
    total_marks numeric default 100,
    date timestamptz default now(),
    created_at timestamptz default now(),
    primary key (institution_id, id),
    foreign key (institution_id, batch_id) references public.batches(institution_id, id) on delete cascade
);

create table if not exists public.exam_scores (
    id text not null,
    institution_id text not null references public.institutions(id) on delete cascade,
    batch_id text not null,
    student_id text not null,
    name text not null,
    score numeric not null,
    date timestamptz default now(),
    created_at timestamptz default now(),
    primary key (institution_id, id),
    foreign key (institution_id, batch_id) references public.batches(institution_id, id) on delete cascade,
    foreign key (institution_id, student_id) references public.students(institution_id, id) on delete cascade
);

-- 11. Assignments (Homework)
create table if not exists public.assignments (
    id text not null,
    institution_id text not null references public.institutions(id) on delete cascade,
    batch_id text not null,
    title text not null,
    description text,
    due_date timestamptz,
    created_at timestamptz default now(),
    primary key (institution_id, id),
    foreign key (institution_id, batch_id) references public.batches(institution_id, id) on delete cascade
);

-- 12. Timetable Slots
create table if not exists public.timetable_slots (
    id text not null,
    institution_id text not null references public.institutions(id) on delete cascade,
    batch_id text not null,
    day text not null,
    subject text not null,
    start_time text not null,
    end_time text not null,
    room text default '',
    teacher text default '',
    created_at timestamptz default now(),
    primary key (institution_id, id),
    foreign key (institution_id, batch_id) references public.batches(institution_id, id) on delete cascade
);

-- 13. Notices Table
create table if not exists public.notices (
    id text not null,
    institution_id text not null references public.institutions(id) on delete cascade,
    text text not null,
    sender text not null,
    type text default 'notice',
    date timestamptz default now(),
    created_at timestamptz default now(),
    primary key (institution_id, id)
);

-- 14. User Profiles & Device Notification Tokens
create table if not exists public.users (
    id text primary key,
    institution_id text references public.institutions(id) on delete cascade,
    fcm_tokens text[] default '{}',
    dismissed_notices text[] default '{}',
    updated_at timestamptz default now()
);

-- 15. Direct Inbox Notifications
create table if not exists public.notifications (
    id text primary key,
    user_id text not null references public.users(id) on delete cascade,
    institution_id text references public.institutions(id) on delete cascade,
    batch_id text,
    title text not null,
    text text not null,
    type text default 'alert',
    date timestamptz default now(),
    created_at timestamptz default now()
);

-- Performance Indexes
create index if not exists idx_batches_inst on public.batches(institution_id);
create index if not exists idx_students_inst on public.students(institution_id);
create index if not exists idx_batch_students_batch on public.batch_students(institution_id, batch_id);
create index if not exists idx_attendance_lookup on public.attendance(institution_id, batch_id, date);
create index if not exists idx_fee_records_lookup on public.fee_records(institution_id, batch_id, year);
create index if not exists idx_exam_scores_student on public.exam_scores(institution_id, student_id);
create index if not exists idx_assignments_batch on public.assignments(institution_id, batch_id);
create index if not exists idx_timetable_batch on public.timetable_slots(institution_id, batch_id);
create index if not exists idx_notices_inst on public.notices(institution_id, created_at desc);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

-- Enable Row Level Security (RLS) on all tables
alter table public.institutions enable row level security;
alter table public.branches enable row level security;
alter table public.admins enable row level security;
alter table public.batches enable row level security;
alter table public.teachers enable row level security;
alter table public.students enable row level security;
alter table public.batch_students enable row level security;
alter table public.attendance enable row level security;
alter table public.fee_records enable row level security;
alter table public.exams enable row level security;
alter table public.exam_scores enable row level security;
alter table public.assignments enable row level security;
alter table public.timetable_slots enable row level security;
alter table public.notices enable row level security;
alter table public.users enable row level security;
alter table public.notifications enable row level security;

-- Hardened policies for sensitive tables (admins & institutions)
create policy "Allow read access on institutions" on public.institutions for select using (true);
create policy "Service role write access on institutions" on public.institutions for all to service_role using (true) with check (true);
create policy "Allow all on branches" on public.branches for all using (true) with check (true);
create policy "Service role only on admins" on public.admins for all to service_role using (true) with check (true);
create policy "Allow all on batches" on public.batches for all using (true) with check (true);
create policy "Allow all on teachers" on public.teachers for all using (true) with check (true);
create policy "Allow all on students" on public.students for all using (true) with check (true);
create policy "Allow all on batch_students" on public.batch_students for all using (true) with check (true);
create policy "Allow all on attendance" on public.attendance for all using (true) with check (true);
create policy "Allow all on fee_records" on public.fee_records for all using (true) with check (true);
create policy "Allow all on exams" on public.exams for all using (true) with check (true);
create policy "Allow all on exam_scores" on public.exam_scores for all using (true) with check (true);
create policy "Allow all on assignments" on public.assignments for all using (true) with check (true);
create policy "Allow all on timetable_slots" on public.timetable_slots for all using (true) with check (true);
create policy "Allow all on notices" on public.notices for all using (true) with check (true);
create policy "Allow all on users" on public.users for all using (true) with check (true);
create policy "Allow all on notifications" on public.notifications for all using (true) with check (true);

-- Enable Supabase Realtime for relevant tables
alter publication supabase_realtime add table public.institutions;
alter publication supabase_realtime add table public.batches;
alter publication supabase_realtime add table public.students;
alter publication supabase_realtime add table public.attendance;
alter publication supabase_realtime add table public.fee_records;
alter publication supabase_realtime add table public.assignments;
alter publication supabase_realtime add table public.timetable_slots;
alter publication supabase_realtime add table public.notices;
alter publication supabase_realtime add table public.notifications;
